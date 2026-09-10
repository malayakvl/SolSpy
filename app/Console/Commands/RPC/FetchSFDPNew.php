<?php

namespace App\Console\Commands\Rpc;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class FetchSFDPNew extends Command
{
    protected $signature = 'rpc:fetch-sfdp-new';
    protected $description = 'Fetch SFDP status via Solana On-Chain RPC';

    public function handle(): int
    {
        $this->info('Starting On-Chain SFDP status check...');

        // 1. Берем RPC из .env или используем официальный HTTPS RPC по умолчанию
        $envUrl = env('SOLANA_RPC_URL', 'https://api.mainnet-beta.solana.com');
        
        // Исправляем http:// на https:// если случайно указали без S
        $rpcUrl = preg_replace('/^http:\/\//i', 'https://', $envUrl);

        $this->line("Fetching vote accounts from RPC ({$rpcUrl})...");

        try {
            // 2. Делаем запрос к RPC с правильными заголовками
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])
            ->timeout(60)
            ->retry(2, 1000)
            ->post($rpcUrl, [
                'jsonrpc' => '2.0',
                'id'      => 1,
                'method'  => 'getVoteAccounts',
                'params'  => [
                    ['commitment' => 'confirmed']
                ]
            ]);

            if ($response->failed()) {
                $this->error("RPC HTTP Status Code: " . $response->status());
                $this->error("Response Body: " . $response->body());
                return 1;
            }

            $json = $response->json();

            // Проверяем наличие ошибок со стороны самого RPC (например, Rate Limit)
            if (isset($json['error'])) {
                $this->error("Solana RPC Error [{$json['error']['code']}]: {$json['error']['message']}");
                return 1;
            }

            $voteAccountsData = $json['result'] ?? null;

            if (!$voteAccountsData) {
                $this->error("Invalid response payload from Solana RPC. Raw response:");
                $this->line(substr($response->body(), 0, 500));
                return 1;
            }

            // 3. Собираем всех валидаторов (текущих и делинвентных)
            $currentValidators = collect($voteAccountsData['current'] ?? [])->keyBy('votePubkey');
            $delinquentValidators = collect($voteAccountsData['delinquent'] ?? [])->keyBy('votePubkey');

            $dbValidators = DB::table('data.validators')->select('id', 'vote_pubkey')->get();
            $updatedCount = 0;

            foreach ($dbValidators as $validator) {
                $votePubkey = $validator->vote_pubkey;
                $nodeData = $currentValidators->get($votePubkey) ?? $delinquentValidators->get($votePubkey);

                $status = 'none';

                if ($nodeData) {
                    $activatedStake = $nodeData['activatedStake'] ?? 0;
                    $epochCredits = $nodeData['epochCredits'] ?? [];

                    $isGoodPerformance = $this->checkCreditsPerformance($epochCredits);

                    if ($activatedStake > 0 && $isGoodPerformance) {
                        $status = 'onboard';
                    } elseif ($activatedStake > 0 && !$isGoodPerformance) {
                        $status = 'rejected';
                    } elseif ($activatedStake == 0 && $isGoodPerformance) {
                        $status = 'pending';
                    } else {
                        $status = 'rejected';
                    }
                } else {
                    $status = 'retired';
                }

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

            $this->info("SFDP Status sync finished successfully! Updated {$updatedCount} validators.");
            return 0;

        } catch (Exception $e) {
            $this->error('Error executing SFDP check: ' . $e->getMessage());
            Log::channel('sfdp')->error('Error: ' . $e->getMessage());
            return 1;
        }
    }

    private function checkCreditsPerformance(array $epochCredits): bool
    {
        if (count($epochCredits) < 2) {
            return false;
        }

        $recentEpochs = array_slice($epochCredits, -5);
        $diffs = [];

        for ($i = 1; $i < count($recentEpochs); $i++) {
            $prevCredits = $recentEpochs[$i - 1][1] ?? 0;
            $currentCredits = $recentEpochs[$i][1] ?? 0;
            $diffs[] = max(0, $currentCredits - $prevCredits);
        }

        if (empty($diffs)) {
            return false;
        }

        $avgCreditsPerEpoch = array_sum($diffs) / count($diffs);
        return $avgCreditsPerEpoch >= 300000;
    }
}