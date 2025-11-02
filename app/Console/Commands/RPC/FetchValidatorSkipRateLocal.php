<?php

namespace App\Console\Commands\Rpc;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FetchValidatorSkipRateLocal extends Command
{
    protected $signature = 'rpc:fetch-validator-skip-rate-local';
    protected $description = 'Fetch skip rate for all validators from RPC';

    protected $rpcUrl = 'http://103.167.235.81:8899';

    public function handle()
    {
        Log::info("Fetching skip rate for all validators");

        $epoch = $this->getCurrentEpoch();
        $this->info("Current epoch: {$epoch}");

        // Получаем данные о валидаторах
        $voteAccounts = $this->getVoteAccounts();
        
        if (!$voteAccounts) {
            $this->error("Failed to fetch vote accounts");
            return;
        }

        $this->info("Processing " . count($voteAccounts) . " vote accounts");

        foreach ($voteAccounts as $account) {
            try {
                $this->processVoteAccount($account, $epoch);
            } catch (\Exception $e) {
                Log::error("Error processing vote account {$account['votePubkey']}: " . $e->getMessage());
                $this->error("Error processing vote account {$account['votePubkey']}: " . $e->getMessage());
            }
        }

        $this->cleanup();
        $this->info("✅ Skip rate data fetched for all validators (epoch {$epoch})");
        
        // Проверяем количество записей в таблице
        $count = DB::table('data.validator_skiprate')->count();
        $this->info("Total records in validator_skiprate table: {$count}");
    }

    private function processVoteAccount($account, $epoch)
    {
        $votePubkey = $account['votePubkey'];
        $nodePubkey = $account['nodePubkey'] ?? null;
        
        $this->info("Processing vote account: {$votePubkey}");

        // Получаем кредиты за текущую эпоху
        $epochCredits = $account['epochCredits'];
        
        // Ищем кредиты за текущую эпоху
        $currentEpochCredits = null;
        $previousEpochCredits = null;
        
        for ($i = 0; $i < count($epochCredits); $i++) {
            if ($epochCredits[$i][0] == $epoch) {
                $currentEpochCredits = $epochCredits[$i];
                // Получаем предыдущую эпоху для расчета
                if ($i > 0) {
                    $previousEpochCredits = $epochCredits[$i - 1];
                }
                break;
            }
        }
        
        // Если нет данных за текущую эпоху, пропускаем
        if (!$currentEpochCredits) {
            $this->info("No credits data for current epoch {$epoch} for validator {$votePubkey}");
            return;
        }
        
        // Рассчитываем skip rate
        $creditsEarned = 0;
        $totalCreditsPossible = 0;
        
        if ($previousEpochCredits) {
            // Кредиты, заработанные в текущей эпохе
            $creditsEarned = $currentEpochCredits[1] - $previousEpochCredits[1];
            // Максимально возможные кредиты (обычно 432000 в эпохе)
            $totalCreditsPossible = $currentEpochCredits[0] - $previousEpochCredits[0];
        } else {
            // Если это первая запись, используем данные текущей эпохи
            $creditsEarned = $currentEpochCredits[1];
            $totalCreditsPossible = $currentEpochCredits[0];
        }
        
        // Рассчитываем skip rate
        $produced = $creditsEarned;
        $skipped = max(0, $totalCreditsPossible - $creditsEarned);
        $total = max(1, $produced + $skipped);
        $skipRate = round(($skipped / $total) * 100, 2);
        
        $this->info("Stats for {$votePubkey}: total={$total}, produced={$produced}, skipped={$skipped}, skipRate={$skipRate}%");

        // Проверяем, существует ли уже запись для этого валидатора и эпохи
        $existing = DB::table('data.validator_skiprate')
            ->where('vote_pubkey', $votePubkey)
            ->where('epoch', $epoch)
            ->first();

        if ($existing) {
            // Обновляем существующую запись
            $updateData = [
                'total_slots'   => $total,
                'produced'      => $produced,
                'skipped'       => $skipped,
                'skip_rate'     => $skipRate,
                'updated_at'    => now(),
            ];
            
            // Добавляем node_pubkey только если он есть
            if ($nodePubkey) {
                $updateData['node_pubkey'] = $nodePubkey;
            }
            
            $updated = DB::table('data.validator_skiprate')
                ->where('id', $existing->id)
                ->update($updateData);
            $this->info("Updated existing record for {$votePubkey}, rows affected: {$updated}");
        } else {
            // Создаем новую запись
            $insertData = [
                'vote_pubkey'   => $votePubkey,
                'epoch'         => $epoch,
                'total_slots'   => $total,
                'produced'      => $produced,
                'skipped'       => $skipped,
                'skip_rate'     => $skipRate,
                'created_at'    => now(),
                'updated_at'    => now(),
            ];
            
            // Добавляем node_pubkey только если он есть
            if ($nodePubkey) {
                $insertData['node_pubkey'] = $nodePubkey;
            }
            
            $insertedId = DB::table('data.validator_skiprate')->insertGetId($insertData);
            $this->info("Inserted new record for {$votePubkey} with ID: {$insertedId}");
        }

        $this->info("✅ Skip rate for {$votePubkey}: {$skipRate}% (produced: {$produced}, skipped: {$skipped})");
    }

    private function rpc($method, $params = [])
    {
        $payload = json_encode([
            'jsonrpc' => '2.0',
            'id'      => 1,
            'method'  => $method,
            'params'  => $params,
        ]);

        $ch = curl_init($this->rpcUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        $response = curl_exec($ch);

        if (curl_errno($ch)) {
            Log::error("RPC Error: " . curl_error($ch));
            curl_close($ch);
            return null;
        }

        curl_close($ch);
        $result = json_decode($response, true);
        
        if (isset($result['error'])) {
            Log::error("RPC Error Response: " . json_encode($result['error']));
            return null;
        }
        
        return $result['result'] ?? null;
    }

    private function getCurrentEpoch()
    {
        $epochInfo = $this->rpc('getEpochInfo');
        $epoch = $epochInfo['epoch'] ?? 0;
        $this->info("Retrieved current epoch: {$epoch}");
        return $epoch;
    }

    private function getVoteAccounts()
    {
        $this->info("Fetching vote accounts");
        $voteAccounts = $this->rpc('getVoteAccounts');
        
        if (!$voteAccounts) {
            $this->info("No vote accounts returned");
            return null;
        }
        
        // Объединяем текущие и делегированные аккаунты
        $allAccounts = array_merge(
            $voteAccounts['current'] ?? [],
            $voteAccounts['delinquent'] ?? []
        );
        
        $this->info("Found " . count($allAccounts) . " total vote accounts");
        return $allAccounts;
    }

    private function cleanup()
    {
        // Удаляем данные старше 30 дней
        $deleted = DB::table('data.validator_skiprate')
            ->where('created_at', '<', now()->subDays(30))
            ->delete();
        
        if ($deleted > 0) {
            $this->info("Cleaned up {$deleted} old records");
        }
    }
}