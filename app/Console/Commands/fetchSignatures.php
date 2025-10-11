<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

class FetchSignatures extends Command
{
    protected $signature = 'app:fetch-signatures';
    protected $description = 'Fetch and store vote signatures for all validators';

    public function handle()
    {
        Log::info('Task app:fetch-signatures started at: ' . now());
        $this->info('Start fetching signatures!');

        $rpcNode = ['url' => 'http://103.167.235.81:8899', 'name' => 'Local RPC'];
        $client = new Client([
            'base_uri' => $rpcNode['url'],
            'timeout' => 60,
            'connect_timeout' => 10,
        ]);

        // Проверка здоровья RPC
        if (!$this->checkNodeHealth($client)) {
            $this->error("RPC node {$rpcNode['name']} ({$rpcNode['url']}) is not healthy");
            Log::error("RPC node is not healthy", ['node' => $rpcNode]);
            return 1;
        }

        // Получение текущего слота
        $currentSlot = $this->getCurrentSlot($client);
        if (!$currentSlot) {
            $this->error("Failed to fetch current slot");
            Log::error("Failed to fetch current slot");
            return 1;
        }
        $this->info("Current slot: $currentSlot");

        // Получение списка валидаторов
        $validators = $this->getVoteAccounts($client);
        if (!$validators) {
            $this->error("Failed to fetch validators");
            Log::error("Failed to fetch validators");
            return 1;
        }
        $this->info("Processing signatures for " . count($validators) . " validators");
        foreach ($validators as $validator) {
            $votePubkey = $validator['votePubkey'];
            $this->info("Fetching signatures for $votePubkey");

            $signatures = $this->getVoteSignatures($client, $votePubkey, $currentSlot);
            if (empty($signatures)) {
                $this->warn("No signatures fetched for $votePubkey");
                Log::warning("No signatures fetched", ['votePubkey' => $votePubkey]);
                continue;
            }
            
            // Convert signatures to JSON and properly escape for database insertion
            $jsonData = json_encode($signatures, true);
            
            // Use Laravel's database query builder with parameter binding instead of pg_escape_string
            DB::statement('SELECT data.insert_validator_signatures(?, ?)', [$jsonData, $votePubkey]);
            $this->info("Saved " . count($signatures) . " signatures for $votePubkey");
        }

        // Очистка старых подписей (старше 24 часов)
        DB::table('data.validator_signatures')->where('created_at', '<', now()->subDay())->delete();
        $this->info("Cleared old signatures");

        $this->info("Task app:fetch-signatures completed");
        return 0;
    }

    private function checkNodeHealth($client)
    {
        try {
            $response = $client->post('', [
                'json' => [
                    'jsonrpc' => '2.0',
                    'id' => 1,
                    'method' => 'getHealth'
                ]
            ]);
            $jsonData = json_decode($response->getBody()->getContents(), true);
            return isset($jsonData['result']) && $jsonData['result'] === 'ok';
        } catch (\Exception $e) {
            Log::error('getHealth error', ['error' => $e->getMessage()]);
            return false;
        }
    }

    private function getCurrentSlot($client)
    {
        try {
            $response = $client->post('', [
                'json' => [
                    'jsonrpc' => '2.0',
                    'id' => 1,
                    'method' => 'getSlot'
                ]
            ]);
            $jsonData = json_decode($response->getBody()->getContents(), true);
            return $jsonData['result'] ?? null;
        } catch (\Exception $e) {
            Log::error('getCurrentSlot error', ['error' => $e->getMessage()]);
            return null;
        }
    }

    private function getVoteAccounts($client)
    {
        try {
            $response = $client->post('', [
                'json' => [
                    'jsonrpc' => '2.0',
                    'id' => 1,
                    'method' => 'getVoteAccounts'
                ]
            ]);
            $jsonData = json_decode($response->getBody()->getContents(), true);
            return $jsonData['result']['current'] ?? [];
        } catch (\Exception $e) {
            Log::error('getVoteAccounts error', ['error' => $e->getMessage()]);
            return [];
        }
    }

    private function getVoteSignatures($client, $votePubkey, $currentSlot)
    {
        try {
            // Получаем последнюю подпись для пагинации
            $response = $client->post('', [
                'json' => [
                    'jsonrpc' => '2.0',
                    'id' => 1,
                    'method' => 'getSignaturesForAddress',
                    'params' => [$votePubkey, ['limit' => 1, 'commitment' => 'finalized']]
                ]
            ]);
            $jsonData = json_decode($response->getBody()->getContents(), true);
            if (isset($jsonData['error'])) {
                Log::error('getSignaturesForAddress (initial) error', [
                    'error' => $jsonData['error'],
                    'votePubkey' => $votePubkey
                ]);
                return [];
            }
            $beforeSignature = $jsonData['result'][0]['signature'] ?? null;

            // Получаем до 100 подписей
            $response = $client->post('', [
                'json' => [
                    'jsonrpc' => '2.0',
                    'id' => 1,
                    'method' => 'getSignaturesForAddress',
                    'params' => [$votePubkey, [
                        'limit' => 100,
                        'commitment' => 'finalized',
                        'minContextSlot' => $currentSlot - 2000,
                        'before' => $beforeSignature
                    ]]
                ]
            ]);
            $jsonData = json_decode($response->getBody()->getContents(), true);
            if (isset($jsonData['error'])) {
                Log::error('getSignaturesForAddress error', [
                    'error' => $jsonData['error'],
                    'votePubkey' => $votePubkey
                ]);
                return [];
            }
            $signatures = $jsonData['result'] ?? [];
            Log::info("Raw signatures fetched", [
                'count' => count($signatures),
                'signatures' => array_slice($signatures, 0, 5),
                'votePubkey' => $votePubkey
            ]);
            return $signatures;
        } catch (RequestException $e) {
            Log::error('getVoteSignatures error', [
                'error' => $e->getMessage(),
                'votePubkey' => $votePubkey
            ]);
            return [];
        }
    }
}