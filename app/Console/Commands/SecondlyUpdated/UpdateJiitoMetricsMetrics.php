<?php

namespace App\Console\Commands\SecondlyUpdated;

use Dotenv\Dotenv;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Exception;

class UpdateJiitoMetricsMetrics extends Command
{
    protected $signature = 'score:update-jito-metrics';
    protected $description = 'Update score jito metrics';


    public function handle()
    {
        $dbSettings = DB::table('data.settings')->first();
        $collectLength = $dbSettings->collect_score_retention ?? 10;
        $targetEpoch = (int)($dbSettings->epoch ?? 0);

        Log::info('Command score:update-jito metrics executed at ' . now());
        $this->info("Start updating score metrics local (Epoch: $targetEpoch, keeping last $collectLength collections)!");

        try {
            $currentEpoch = $targetEpoch;
            $this->info("Fetchin jito metrics");
//            $voteAccount = '53RJBy7aBGA7Aag6AryxEmBbsHDgwfBWagLrPbGHnfvR';
            $jitoValidators = $this->fetchJitoValidators($currentEpoch);

            foreach ($jitoValidators as $voteAccount => &$validatorData) {
                $stewardScore = $this->fetchJitoStewardScore($voteAccount);

                $validatorData['jito_scores_data'] = $stewardScore;
                $validatorData['jito_score'] = $stewardScore['score'] ?? null;
                $validatorData['jito_raw_score'] = $stewardScore['raw_score'] ?? null;
                $validatorData['jito_eligible'] = ($stewardScore['score'] ?? 0) > 0;
            }

            unset($validatorData);
            if (!empty($jitoValidators)) {
                // Преобразуем ассоциативный массив в список объектов для корректного JSON-массива в Postgres
                $payloadJson = json_encode(array_values($jitoValidators));

                // Вызываем функцию PostgreSQL
                $result = DB::select('SELECT data.update_jito_validator_metrics(?, ?) AS inserted_count', [
                    $payloadJson,
                    $currentEpoch
                ]);

                $insertedCount = $result[0]->inserted_count ?? 0;

                $this->info("Успешно сохранено $insertedCount записей в таблицу data.jito_validator_metrics.");
            } else {
                $this->warn("Массив $jitoValidators пуст, нечего сохранять.");
            }

//            $this->cleanupOldData($collectLength);

            $this->info("All done! Time to sleep 😴");
            return 0;

        } catch (\Exception $e) {
            $this->error('Error: ' . $e->getMessage());
            Log::error('Validator update failed', ['error' => $e->getMessage()]);
            return 1;
        }
    }

    private function fetchLatestJitoStewardScores(): array
    {
        $scores = [];
        $limit = 100;
        $skip = 0;
        $maxPages = 10;

        for ($page = 0; $page < $maxPages; $page++) {
            $url = 'https://kobe.mainnet.jito.network/api/v1/steward_events?'
                . http_build_query([
                    'event_type' => 'ScoreComponents',
                    'limit' => $limit,
                    'skip' => $skip,
                ]);

            $ch = curl_init($url);

            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPGET => true,
                CURLOPT_HTTPHEADER => ['Accept: application/json'],
                CURLOPT_CONNECTTIMEOUT => 10,
                CURLOPT_TIMEOUT => 10,
            ]);

            $response = curl_exec($ch);
            $error = curl_error($ch);
            curl_close($ch);

            if ($response === false || $error) {
                $this->error('Jito Steward API error: ' . $error);
                break;
            }

            $data = json_decode($response, true);
            $events = $data['events'] ?? [];

            if (!is_array($events) || $events === []) {
                break;
            }

            foreach ($events as $event) {
                $voteAccount = $event['vote_account'] ?? null;
                $scoreData = $event['data'] ?? null;

                // API возвращает новые события первыми.
                if ($voteAccount && is_array($scoreData) && !isset($scores[$voteAccount])) {
                    $scores[$voteAccount] = $scoreData;
                }
            }

            if (count($events) < $limit) {
                break;
            }

            $skip += count($events);
        }

        return $scores;
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
                CURLOPT_TIMEOUT => 15,
            ]);

            $response = curl_exec($ch);
            $error = curl_error($ch);
            curl_close($ch);

            if ($response === false || $error) {
                $this->error('Jito Steward API error: ' . $error);
                break;
            }

            $data = json_decode($response, true);
            dd($data);exit;
            $events = $data['events'] ?? [];

            if (!is_array($events) || $events === []) {
                break;
            }

            foreach ($events as $event) {
                $voteAccount = $event['vote_account'] ?? null;
                $scoreData = $event['data'] ?? null;

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




    private function fetchJitoValidators(?int $epoch = null): array
    {
        $url = 'https://kobe.mainnet.jito.network/api/v1/validators';

        if ($epoch !== null) {
            $url .= '?' . http_build_query(['epoch' => $epoch]);
        }

        $ch = curl_init($url);

        if ($ch === false) {
            $this->error('Unable to initialize cURL for Jito validators');
            return [];
        }

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
            $this->error('cURL Error (Jito validators): ' . $curlError);
            return [];
        }

        if ($httpCode < 200 || $httpCode >= 300) {
            $this->error("Jito API returned HTTP {$httpCode}");
            return [];
        }

        $jsonData = json_decode($response, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->error('Invalid JSON from Jito API: ' . json_last_error_msg());
            return [];
        }

        $validators = $jsonData['validators'] ?? [];

        if (!is_array($validators)) {
            $this->error('Unexpected Jito validators response format');
            return [];
        }

        return collect($validators)
            ->filter(fn (array $validator) => !empty($validator['vote_account']))
            ->keyBy('vote_account')
            ->all();
    }
}