<?php

namespace App\Console\Commands\Discord;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Exception;

class UpdateScoreMetricsLocal extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'score:update-metrics';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update score metrics local';
    
    protected $rpcUrl = 'http://103.167.235.81:8899';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Get collectLength from settings table
        $dbSettings = DB::table('data.settings')->first();
        $collectLength = $dbSettings->collect_score_retention ?? 10;
        
        Log::info('Command score:update-metrics executed at ' . now());
        $this->info("Start updating score metrics local (keeping last $collectLength collections)!");

        try {
            // First, get cluster nodes information to build version map
            $this->info("Fetching cluster nodes information...");
            $nodeData = $this->fetchClusterNodes();
            $validatorsMap = array();

            // Create version map: nodePubkey → version
            $versionMap = [];
            if (!empty($nodeData)) {
                foreach ($nodeData as $node) {
                    if (isset($node['pubkey'], $node['version'])) {
                        $versionMap[$node['pubkey']] = $node['version'];
                        $validatorsMap[$node['pubkey']]['version'] = $node['version'];
                    }
                }
            }
            $this->info("Found versions for " . count($versionMap) . " nodes");
            // Then get vote accounts data
            $this->info("Fetching vote accounts...");

            // 1. Получаем валидаторов из сети
            $voteData = $this->fetchVoteAccounts();
            // 2. Сразу высчитываем TVC-ранги для всей сети
            $tvcRanks = $this->calculateTvcRanks($voteData);
            
            if (!$voteData) {
                echo "Failed to fetch vote accounts data\n";
                return 1;
            }

            
            // Get validators data
            $currentValidators = $voteData['current'] ?? [];
            $delinquentValidators = $voteData['delinquent'] ?? [];
            
            // Combine all validators
            $validators = array_merge($currentValidators, $delinquentValidators);
            
            // Sort validators by credits (using last epoch data)
            usort($validators, function($a, $b) {
                $aCredits = 0;
                $bCredits = 0;
                
                if (!empty($a['epochCredits'])) {
                    $lastEpoch = end($a['epochCredits']);
                    $aCredits = $lastEpoch[1] - $lastEpoch[2];
                }
                
                if (!empty($b['epochCredits'])) {
                    $lastEpoch = end($b['epochCredits']);
                    $bCredits = $lastEpoch[1] - $lastEpoch[2];
                }
                
                return $bCredits <=> $aCredits;
            });
            
            // Prepare validator data for database insertion (similar to FetchValidatorsServer)
            $validatorScores = [];
            
            // Process all validators and prepare data for database insertion
            for ($i = 0; $i < count($validators); $i++) {
                $v = $validators[$i];
                $identity = $v['nodePubkey'] ?? '';
                $vote = $v['votePubkey'] ?? '';
                
                // Get credits from last epoch
                $credits = 0;
                if (!empty($v['epochCredits'])) {
                    $lastEpoch = end($v['epochCredits']);
                    $credits = $lastEpoch[1] - $lastEpoch[2];
                }
                
                $lastVote = $v['lastVote'] ?? 0;
                $rootSlot = $v['rootSlot'] ?? 0;
                $commission = $v['commission'] ?? 0;
                $activatedStake = $v['activatedStake'] ?? 0;
                
                // Get version from our map
                $version = $versionMap[$identity] ?? 'unknown';
                
                // Calculate stake in SOL
                $stakeSol = $activatedStake / 1000000000; // Convert lamports to SOL
                $stakePercentage = 0.02; // Placeholder percentage

                $tvcScore = $tvcRanks[$vote] ?? null;

                $epochCredits = $account['epochCredits'] ?? [];

                $validatorCredits = 0;

                if (!empty($epochCredits)) {
                    // Берем последний массив (текущая эпоха 1026)
                    $currentEpochData = end($epochCredits);

                    // Считаем заработанное: [1] minus [2]
                    $validatorCredits = max(0, $currentEpochData[1] - $currentEpochData[2]);
                }

                // Теперь передаем полученные 6_907_308 в нашу функцию аптайма:
                $uptime = $this->calculateNetworkUptime($validatorCredits, $networkCreditsMap);
                
                // Prepare data for database insertion (similar to FetchValidatorsServer lines 75-97)
                $validatorScores[] = [
                    'rank' => $i + 1,
                    'node_pubkey' => $identity,
                    'vote_pubkey' => $vote,
                    'uptime' => '100.00%', // Placeholder, similar to how it would be in CLI output
                    'root_slot' => (int)$rootSlot,
                    'vote_slot' => (int)$lastVote,
                    'commission' => (float)$commission,
                    'credits' => (int)$credits,
                    'version' => $version,
                    'tvc_score' => $tvcScore,
                    'stake' => $stakeSol, // Store as decimal, not string with "SOL"
                    'stake_percent' => $stakePercentage,
                    'collected_at' => now()->format('Y-m-d H:i:s'),
                    'created_at' => now()->format('Y-m-d H:i:s'),
                    'updated_at' => now()->format('Y-m-d H:i:s')
                ];
            }
            dd($validatorScores);exit;


            // Insert validator scores into database using PostgreSQL function
            if (!empty($validatorScores)) {
                $scoresJson = json_encode($validatorScores);
                
//                $insertedCount = DB::select("SELECT data.insert_validator_scores(?::jsonb) as count", [$scoresJson])[0]->count;
                $insertedCount = DB::select(
                    "SELECT data.insert_validator_scores(?::jsonb, ?::integer) as count", 
                    [$scoresJson, $dbSettings->epoch]
                )[0]->count;
                $this->info("Inserted $insertedCount validator scores into database using PostgreSQL function");
            }
            
            // Clean up old data (keep only the specified number of collections)
            $this->cleanupOldData($collectLength);
            
            $this->info("Total validators: " . count($validators));
            $this->info("Current validators: " . count($currentValidators));
            $this->info("Delinquent validators: " . count($delinquentValidators));
            
            $this->info('Data fetched and displayed successfully');
            
            return 0;

        } catch (\Exception $e) {
            $this->error('RPC Error: ' . $e->getMessage());
            \Log::error('Solana RPC failed', ['error' => $e->getMessage()]);
            return 1;
        }
    }

    /**
     * Рассчитывает относительный Live Uptime валидатора на основе кредитов сети.
     *
     * @param int $validatorCredits Кредиты конкретного валидатора за эпохи
     * @param array<int> $allCreditsArray Массив кредитов всех валидаторов сети
     * @return float Процент аптайма (0.00 - 100.00)
     */
    private function calculateNetworkUptime(int $validatorCredits, array $allCreditsArray): float
    {
        if (empty($allCreditsArray) || $validatorCredits <= 0) {
            return 0.00;
        }

        // Находим максимальные кредиты в сети (эталон 100% аптайма)
        $maxNetworkCredits = max($allCreditsArray);

        if ($maxNetworkCredits <= 0) {
            return 100.00;
        }

        // Считаем отношение кредитов валидатора к лидеру сети
        $uptime = ($validatorCredits / $maxNetworkCredits) * 100;

        // Ограничиваем от 0 до 100 и округляем до 2 знаков
        return (float) min(100.00, max(0.00, round($uptime, 2)));
    }

    private function calculateTvcRanks($voteAccountsResult): array
    {
        if (!$voteAccountsResult) {
            return [];
        }

        // Объединяем активных и delinquent валидаторов
        $allValidators = array_merge(
            $voteAccountsResult['current'] ?? [],
            $voteAccountsResult['delinquent'] ?? []
        );

        $creditsMap = [];

        foreach ($allValidators as $val) {
            $pubkey = $val['votePubkey'] ?? null;
            $epochCredits = $val['epochCredits'] ?? [];

            if ($pubkey && !empty($epochCredits)) {
                // Берем текущую эпоху (последний элемент массива)
                $currentEpoch = end($epochCredits);
                // Заработанные кредиты = конец минус начало
                $earnedCredits = max(0, $currentEpoch[1] - $currentEpoch[2]);

                $creditsMap[$pubkey] = $earnedCredits;
            } else {
                $creditsMap[$pubkey] = 0;
            }
        }

        // Сортируем валидаторов от большего количества кредитов к меньшему
        arsort($creditsMap);

        // Присваиваем порядковый номер (Rank/Score): 1, 2, 3 ... 186 ... 688
        $tvcRanks = [];
        $rank = 1;
        foreach ($creditsMap as $pubkey => $credits) {
            // Записываем только тех, у кого ненулевые кредиты (как требует клиент)
            if ($credits > 0) {
                $tvcRanks[$pubkey] = $rank;
                $rank++;
            } else {
                $tvcRanks[$pubkey] = null; // Нода оффлайн / 0 кредитов
            }
        }

        return $tvcRanks;
    }
    
    /**
     * Clean up old data, keeping only the specified number of collections
     */
    private function cleanupOldData($collectLength)
    {
        // Get the distinct collection times, ordered by newest first
        $collections = DB::table('data.validator_scores')
            ->select('collected_at')
            ->groupBy('collected_at')
            ->orderBy('collected_at', 'desc')
            ->limit($collectLength)
            ->pluck('collected_at');
        
        // If we have more than the specified number of collections, delete the oldest ones
        if ($collections->count() >= $collectLength) {
            $oldestToKeep = $collections->last();
            $deleted = DB::table('data.validator_scores')
                ->where('collected_at', '<', $oldestToKeep)
                ->delete();
                
            if ($deleted > 0) {
                $this->info("Cleaned up old data, deleted $deleted records. Keeping collections from " . $oldestToKeep);
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


    private function fetchVoteAccount(string $votePubkey): ?array
    {
        $data = [
            'jsonrpc' => '2.0',
            'id' => 1,
            'method' => 'getVoteAccounts',
            'params' => [[
                'commitment' => 'finalized',
                'votePubkey' => $votePubkey,
                'keepUnstakedDelinquents' => true,
            ]],
        ];

        $ch = curl_init($this->rpcUrl);

        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Accept: application/json',
            ],
            CURLOPT_POSTFIELDS => json_encode($data, JSON_THROW_ON_ERROR),
            CURLOPT_TIMEOUT => 15,
        ]);

        $response = curl_exec($ch);

        if ($response === false) {
            throw new \RuntimeException(
                'cURL error: ' . curl_error($ch)
            );
        }

        curl_close($ch);

        $jsonData = json_decode($response, true, 512, JSON_THROW_ON_ERROR);

        if (isset($jsonData['error'])) {
            throw new \RuntimeException($jsonData['error']['message'] ?? 'Solana RPC error');
        }

        // Валидатор может быть active или delinquent.
        return $jsonData['result']['current'][0]
            ?? $jsonData['result']['delinquent'][0]
            ?? null;
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