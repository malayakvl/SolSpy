<?php

namespace App\Console\Commands\SecondlyUpdated;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Exception;

class UpdateJitoScoreMetrics extends Command
{
    protected $signature = 'score:update-jito-score-metrics';
    protected $description = 'Update score jito metrics via bam_validator_score';

    public function handle()
    {
        $dbSettings = DB::table('data.settings')->first();
        $targetEpoch = (int)($dbSettings->epoch ?? 0);

        Log::info("Command score:update-jito-score-metrics executed at " . now());
        $this->info("Start updating Jito metrics (Epoch: {$targetEpoch})...");

        try {
            // 1. Получаем список валидаторов Jito
            $jitoValidators = $this->fetchJitoValidators($targetEpoch);

            if (empty($jitoValidators)) {
                $this->warn("Список валидаторов Jito пуст.");
                return 0;
            }

            $this->info("Найдено валидаторов: " . count($jitoValidators) . ". Получаем bam_validator_score...");

            $results = [];

            // 2. Бежим по каждому валидатору и дергаем bam_validator_score
            foreach ($jitoValidators as $voteAccount => $validatorData) {
                $scoreData = $this->fetchBamValidatorScore($voteAccount, $targetEpoch);

                if ($scoreData) {
                    $results[] = [
                        'vote_account' => $voteAccount,
                        'score'        => $scoreData['score'] ?? null,
                        'jito_score'   => $scoreData['score'] ?? null,
                        'data'         => $scoreData
                    ];
                }
            }

            if (empty($results)) {
                $this->warn("Не удалось получить ни одного скора.");
                return 0;
            }
            // 3. Записываем результатирующий JSON в БД
            $payloadJson = json_encode($results);
exit;
            $result = DB::select('SELECT data.update_jito_validator_metrics(?, ?) AS inserted_count', [
                $payloadJson,
                $targetEpoch
            ]);

            $insertedCount = $result[0]->inserted_count ?? 0;
            $this->info("Успешно сохранено {$insertedCount} записей в data.jito_validator_metrics.");

            return 0;

        } catch (Exception $e) {
            $this->error('Ошибка: ' . $e->getMessage());
            Log::error('Jito metrics update failed', ['error' => $e->getMessage()]);
            return 1;
        }
    }

    /**
     * Запрос скора валидатора: /api/v1/bam_validator_score?epoch=X&vote_account=Y
     */
    private function fetchBamValidatorScore(string $voteAccount, int $epoch): ?array
    {
        $url = 'https://kobe.mainnet.jito.network/api/v1/bam_validator_score?' . http_build_query([
                'epoch' => $epoch,
                'vote_account' => $voteAccount,
            ]);

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPGET => true,
            CURLOPT_HTTPHEADER => ['Accept: application/json'],
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 10,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if (!$response || $httpCode < 200 || $httpCode >= 300) {
            return null;
        }

        $data = json_decode($response, true);
        return is_array($data) ? $data : null;
    }

    /**
     * Получение списка всех валидаторов Jito
     */
    private function fetchJitoValidators(int $epoch): array
    {
        $url = 'https://kobe.mainnet.jito.network/api/v1/validators?' . http_build_query(['epoch' => $epoch]);

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPGET => true,
            CURLOPT_HTTPHEADER => ['Accept: application/json'],
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => 20,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if (!$response || $httpCode < 200 || $httpCode >= 300) {
            return [];
        }

        $jsonData = json_decode($response, true);
        $validators = $jsonData['validators'] ?? [];

        if (!is_array($validators)) {
            return [];
        }

        return collect($validators)
            ->filter(fn (array $v) => !empty($v['vote_account']))
            ->keyBy('vote_account')
            ->all();
    }
}