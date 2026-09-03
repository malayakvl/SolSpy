<?php

namespace App\Console\Commands\Rpc;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class FetchSFDP extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'rpc:fetch-sfdp';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch official SFDP statuses from Solana Foundation API';

    /**
     * Официальный REST API Solana Foundation (для Testnet/Mainnet)
     * Можно вынести в config/services.php или .env
     */
    private string $sfdpApiUrl = 'https://testnet-api.solana.org/api/validators';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting official SFDP status sync...');
        Log::channel('sfdp')->info('Starting official SFDP sync at ' . now());

        try {
            // 1. Запрашиваем официальный список участников SFDP от Solana Foundation
            $response = Http::timeout(30)
                ->retry(3, 1000)
                ->get($this->sfdpApiUrl);

            if ($response->failed()) {
                $errorMsg = "Failed to fetch SFDP API data. HTTP Status: " . $response->status();
                $this->error($errorMsg);
                Log::channel('sfdp')->error($errorMsg);
                return 1;
            }

            $sfdpData = $response->json();
            
            if (empty($sfdpData) || !is_array($sfdpData)) {
                $this->error('SFDP API returned empty or invalid payload.');
                Log::channel('sfdp')->error('SFDP API returned empty response.');
                return 1;
            }

            // Индексируем массив SFDP по vote_account для мгновенного O(1) поиска
            $sfdpMap = collect($sfdpData)->keyBy('vote_account');

            // 2. Получаем наших валидаторов из локальной БД
            $validators = DB::table('data.validators')
                ->select('id', 'vote_pubkey')
                ->get();

            $updatedCount = 0;

            // 3. Сопоставляем данные
            foreach ($validators as $validator) {
                $votePubkey = $validator->vote_pubkey;
                $officialRecord = $sfdpMap->get($votePubkey);

                // Определение официального статуса
                $status = $this->determineStatus($officialRecord);

                // Обновляем запись в БД
                DB::table('data.validators')
                    ->where('id', $validator->id)
                    ->update([
                        'sfdp_status' => $status,
                        'updated_at'  => now(),
                    ]);

                $this->line("Validator ID {$validator->id} ({$votePubkey}): SFDP Status -> [{$status}]");
                $updatedCount++;
            }

            $this->info("SFDP sync completed successfully! Processed {$updatedCount} validators.");
            Log::channel('sfdp')->info("Successfully updated SFDP statuses for {$updatedCount} validators.");

            return 0;

        } catch (Exception $e) {
            $this->error('Error executing SFDP fetch: ' . $e->getMessage());
            Log::channel('sfdp')->error('Error executing SFDP fetch: ' . $e->getMessage(), [
                'exception' => $e
            ]);
            return 1;
        }
    }

    /**
     * Парсинг официального статуса из структуры ответа Solana Foundation
     */
    private function determineStatus(?array $record): string
    {
        if (!$record) {
            return 'none'; // Валидатор вообще не подавал заявку в SFDP
        }

        // Проверяем флаг дисквалификации (Delisted / Rejected)
        if (!empty($record['delisted']) && $record['delisted'] === true) {
            return 'rejected';
        }

        // Проверяем явный статус от API
        $rawStatus = strtolower($record['status'] ?? '');

        return match ($rawStatus) {
            'onboarded', 'approved', 'active' => 'onboard',
            'pending', 'submitted'            => 'pending',
            'rejected', 'delisted'            => 'rejected',
            'retired', 'removed'             => 'retired',
            default                            => !empty($rawStatus) ? $rawStatus : 'none',
        };
    }
}