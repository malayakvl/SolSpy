<?php

namespace App\Console\Commands\SecondlyUpdated;

use Dotenv\Dotenv;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use phpseclib3\Net\SSH2;

class UpdateScoreMetricsLocal extends Command
{
    protected $signature = 'score:update-metrics-common';
    protected $description = 'Update score metrics local';

    protected $rpcUrl = 'http://103.167.235.81:8899';

    public function handle()
    {
        $dbSettings = DB::table('data.settings')->first();
        $collectLength = $dbSettings->collect_score_retention ?? 10;
        $targetEpoch = (int)($dbSettings->epoch ?? 0);
        $solanaPath = '/usr/local/bin/solana';
dd(1);
        Log::info('Command score:update-metrics executed at ' . now());
        $this->info("Start updating score metrics local (Epoch: $targetEpoch, keeping last $collectLength collections)!");
        try {
            $dotenv = Dotenv::createImmutable(base_path());
            $dotenv->load();
        } catch (\Exception $e) {
            $this->error("Failed to load .env file: " . $e->getMessage());
            Log::channel('sfdp')->error("Failed to load .env file: " . $e->getMessage());
            return 1;
        }

        try {

            $this->info("Connecting to validator server via SSH...");
            $ssh = new SSH2(env('VALIDATOR_SERVER_HOST', '103.167.235.81'));
            $ssh->setTimeout(30);

            $loginSuccess = $ssh->login(
                env('VALIDATOR_SERVER_USER', 'root'),
                env('VALIDATOR_SERVER_PASSWORD')
            );

            if (!$loginSuccess) {
                $this->error('SSH login failed');
                return 1;
            }


            // 1. Подключаемся и выполняем команду Solana CLI
            $command = "{$solanaPath} validators -um --sort=credits --output json";
            $output = $ssh->exec($command);

            if (empty($output)) {
                $this->error('CLI command returned empty output');
                return 1;
            }

            $cliData = json_decode($output, true);
            if (!$cliData || !isset($cliData['validators'])) {
                $this->error('Failed to parse Solana CLI JSON output');
                return 1;
            }

            $validators = $cliData['validators'];
            $currentEpoch = $cliData['epoch'] ?? $targetEpoch;
            if ($targetEpoch <= 0) {
                $targetEpoch = (int)$currentEpoch;
            }

            // 1. Получаем массив с vote-аккаунтами из RPC
            $dValidatorData = $this->fetchVoteAccounts();

            $epochCreditsMap = [];

            // Объединяем "current" и "delinquent" (на случай, если валидатор отстал, но всё равно есть в сети)
            $allAccounts = array_merge(
                $dValidatorData['current'] ?? [],
                $dValidatorData['delinquent'] ?? []
            );

// Собираем карту: votePubkey => массив из 5 эпох (array:5)
            foreach ($allAccounts as $acc) {
                if (isset($acc['votePubkey'], $acc['epochCredits'])) {
                    $epochCreditsMap[$acc['votePubkey']] = $acc['epochCredits'];
                }
            }

            $this->info("Processing " . count($validators) . " validators for Epoch {$targetEpoch}...");

            // 2. СОРТИРУЕМ ВРУЧНУЮ ПО epochCredits (ПО УБЫВАНИЮ)
            // Это дает точный порядок 1 в 1 как в консоли Solana CLI (наш 134 ранг)
            usort($validators, function ($a, $b) {
                $creditsA = $a['epochCredits'] ?? 0;
                $creditsB = $b['epochCredits'] ?? 0;
                return $creditsB <=> $creditsA;
            });

            // 3. Рассчитываем TVC-ранги для всей сети
            $this->calculateTvcRanks($validators, $targetEpoch);

            // Берем максимальное значение кредитов за эпоху (максимум среди лидирующих нод)
            $maxCreditsInNetwork = !empty($validators) ? ($validators[0]['epochCredits'] ?? 0) : 0;

            // Рассчитываем общий стейк сети для подсчета stake_percent
            $totalNetworkStake = array_sum(array_column($validators, 'activatedStake')) ?: 1;

            $validatorScores = [];
            $now = now()->format('Y-m-d H:i:s');

            // 4. Формируем финальный массив данных
            foreach ($validators as $index => $v) {
                $identity = $v['identityPubkey'] ?? '';
                $vote = $v['voteAccountPubkey'] ?? '';

                $epochCredits = (int)($v['epochCredits'] ?? 0);
                $validatorCredits = (int)($v['credits'] ?? 0);
                $epochCreditsArray = $epochCreditsMap[$vote] ?? [];
                $activatedStake = (float)($v['activatedStake'] ?? 0);
                $stakeSol = $activatedStake / 1000000000; // перевод Lamports в SOL

                // Процент стейка от сети
                $stakePercentage = round(($activatedStake / $totalNetworkStake) * 100, 4);

                // Uptime / Vote Rate относительно лидера сети
                $uptimeCalc = $this->calculateNetworkUptime($validatorCredits, $maxCreditsInNetwork);
                $uptimeFormatted = number_format($uptimeCalc, 2, '.', '') . '%';


                // Точный расчет Vote Rate за текущую эпоху (например: 99.879)
                $voteRateCalc = $maxCreditsInNetwork > 0
                    ? round(($epochCredits / $maxCreditsInNetwork) * 100, 3)
                    : 0.0;

                $validatorScores[] = [
                    'rank'                => $index + 1,
                    'node_pubkey'         => $identity,
                    'vote_pubkey'         => $vote,
                    'uptime'              => $uptimeFormatted,
                    'vote_rate'           => $voteRateCalc, // <-- Добавили Vote Rate
                    'root_slot'           => (int)($v['rootSlot'] ?? 0),
                    'vote_slot'           => (int)($v['lastVote'] ?? 0),
                    'commission'          => (float)(($v['commissionBps'] ?? 0) / 100),
                    'credits'             => $validatorCredits,
                    'version'             => $v['version'] ?? 'unknown',
                    'stake'               => $stakeSol,
                    'stake_percent'       => $stakePercentage,
                    'tvc_score'           => $index + 1,
                    'epoch_credits'       => $epochCredits,
                    'epoch_credits_array' => $epochCreditsArray,
                    'collected_at'        => $now,
                    'created_at'          => $now,
                    'updated_at'          => $now
                ];
            }

            // 5. Записываем в базу данных PostgreSQL
            // 5. Записываем в базу данных PostgreSQL
            if (!empty($validatorScores)) {
                $scoresJson = json_encode($validatorScores);

                // Берем результат выполнения функции
//                dd($validatorScores[0]);exit;
                $result = DB::selectOne(
                    "SELECT data.update_validator_scores(?::jsonb, ?::integer) as count",
                    [$scoresJson, $targetEpoch]
                );

                $insertedCount = $result->count ?? 0;

                $this->info("Successfully inserted {$insertedCount} validator scores into PostgreSQL.");
            }

            $this->cleanupOldData($collectLength);

            $this->info("All done! Time to sleep 😴");
            return 0;

        } catch (\Exception $e) {
            $this->error('Error: ' . $e->getMessage());
            Log::error('Validator update failed', ['error' => $e->getMessage()]);
            return 1;
        }
    }

    /**
     * Извлекает кредиты, заработанные строго за определенную эпоху
     */
    private function getEarnedCreditsForEpoch(array $epochCredits, int $targetEpoch): int
    {
        foreach ($epochCredits as $tuple) {
            // $tuple[0] = epoch, $tuple[1] = credits end of epoch, $tuple[2] = credits start of epoch
            if (isset($tuple[0]) && (int)$tuple[0] === $targetEpoch) {
                $currentCredits = (int)($tuple[1] ?? 0);
                $prevCredits = (int)($tuple[2] ?? 0);
                return max(0, $currentCredits - $prevCredits);
            }
        }
        return 0;
    }

    /**
     * Рассчитывает относительный Live Uptime валидатора за текущую эпоху в %
     */
    private function calculateNetworkUptime(int $validatorCredits, int $maxNetworkCredits): float
    {
        if ($maxNetworkCredits <= 0) {
            return 100.00;
        }

        if ($validatorCredits <= 0) {
            return 0.00;
        }

        $uptime = ($validatorCredits / $maxNetworkCredits) * 100;
        return (float) min(100.00, max(0.00, round($uptime, 2)));
    }

    private function fetchJitoStewardScores(int $epoch): array
    {
        $scores = [];
        $limit = 100;
        $skip = 0;

        do {
            $url = 'https://kobe.mainnet.jito.network/api/v1/steward_events?'
                . http_build_query([
                    'event_type' => 'ScoreComponents',
                    'epoch' => $epoch,
                    'limit' => $limit,
                    'skip' => $skip,
                ]);

            $ch = curl_init($url);

            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPGET => true,
                CURLOPT_HTTPHEADER => ['Accept: application/json'],
                CURLOPT_CONNECTTIMEOUT => 10,
                CURLOPT_TIMEOUT => 30,
            ]);

            $response = curl_exec($ch);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($response === false || $curlError) {
                $this->error('cURL Error (Jito Steward scores): ' . $curlError);
                break;
            }

            $data = json_decode($response, true);

            if (!is_array($data)) {
                $this->error('Invalid JSON from Jito Steward API');
                break;
            }

            $events = $data['events'] ?? [];

            foreach ($events as $event) {
                $voteAccount = $event['vote_account'] ?? null;
                $scoreData = $event['data'] ?? null;

                // API отдаёт новые события первыми: сохраняем наиболее свежий score.
                if ($voteAccount && is_array($scoreData) && !isset($scores[$voteAccount])) {
                    $scores[$voteAccount] = $scoreData;
                }
            }

            $skip += count($events);
            $total = (int) ($data['total'] ?? 0);
        } while (
            count($events) === $limit
            && ($total === 0 || $skip < $total)
        );

        return $scores;
    }

    private function fetchJitoStewardScore(string $voteAccount, ?int $epoch = null): ?array
    {
        $params = [
            'event_type' => 'ScoreComponents',
            'vote_account' => $voteAccount,
            'limit' => 1,
        ];

        if ($epoch !== null) {
            $params['epoch'] = $epoch;
        }

        $url = 'https://kobe.mainnet.jito.network/api/v1/steward_events?'
            . http_build_query($params);

        $ch = curl_init($url);

        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPGET => true,
            CURLOPT_HTTPHEADER => ['Accept: application/json'],
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => 30,
        ]);

        $response = curl_exec($ch);
        $curlError = curl_error($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        curl_close($ch);

        if ($response === false || $curlError) {
            $this->error('cURL Error (Jito Steward score): ' . $curlError);
            return null;
        }

        if ($httpCode < 200 || $httpCode >= 300) {
            $this->error("Jito Steward API returned HTTP {$httpCode}");
            return null;
        }

        $jsonData = json_decode($response, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->error('Invalid JSON from Jito Steward API');
            return null;
        }

        return $jsonData['events'][0]['data'] ?? null;
    }

    private function calculateTvcRanks(array $allValidators, int $targetEpoch): array
    {
        $creditsMap = [];

        foreach ($allValidators as $val) {
            // Поддержка ключей как SSH CLI (voteAccountPubkey), так и RPC (votePubkey)
            $pubkey = $val['voteAccountPubkey'] ?? $val['votePubkey'] ?? null;
            if (!$pubkey) continue;

            // Если это CLI, там epochCredits лежит прямо числом
            if (isset($val['epochCredits']) && is_numeric($val['epochCredits'])) {
                $earnedCredits = (int)$val['epochCredits'];
            } else {
                // Если это массив из RPC
                $earnedCredits = $this->getEarnedCreditsForEpoch($val['epochCredits'] ?? [], $targetEpoch);
            }

            $creditsMap[$pubkey] = $earnedCredits;
        }

        arsort($creditsMap);

        $tvcRanks = [];
        $rank = 1;
        foreach ($creditsMap as $pubkey => $credits) {
            if ($credits > 0) {
                $tvcRanks[$pubkey] = $rank;
                $rank++;
            } else {
                $tvcRanks[$pubkey] = null;
            }
        }

        return $tvcRanks;
    }

    private function cleanupOldData($collectLength)
    {
        $collections = DB::table('data.validator_score_parameters')
            ->select('collected_at')
            ->groupBy('collected_at')
            ->orderBy('collected_at', 'desc')
            ->limit($collectLength)
            ->pluck('collected_at');

        if ($collections->count() >= $collectLength) {
            $oldestToKeep = $collections->last();
            $deleted = DB::table('data.validator_score_parameters')
                ->where('collected_at', '<', $oldestToKeep)
                ->delete();

            if ($deleted > 0) {
                $this->info("Cleaned up old data, deleted $deleted records.");
            }
        }
    }

    private function fetchClusterNodes()
    {
        $data = [
            'jsonrpc' => '2.0',
            'id' => 2,
            'method' => 'getClusterNodes'
        ];

        $ch = curl_init($this->rpcUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

        $response = curl_exec($ch);
        if (curl_errno($ch)) {
            $this->error('cURL Error (getClusterNodes): ' . curl_error($ch));
            curl_close($ch);
            return null;
        }
        curl_close($ch);

        $jsonData = json_decode($response, true);
        return $jsonData['result'] ?? null;
    }

    private function fetchVoteAccounts()
    {
        $data = [
            'jsonrpc' => '2.0',
            'id' => 1,
            'method' => 'getVoteAccounts'
        ];

        $ch = curl_init($this->rpcUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

        $response = curl_exec($ch);
        if (curl_errno($ch)) {
            $this->error('cURL Error (getVoteAccounts): ' . curl_error($ch));
            curl_close($ch);
            return null;
        }
        curl_close($ch);

        $jsonData = json_decode($response, true);
        return $jsonData['result'] ?? null;
    }
}