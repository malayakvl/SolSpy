<?php

namespace App\Console\Commands\SecondlyUpdated;

use Dotenv\Dotenv;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use phpseclib3\Net\SSH2;


class SyncSolanaValidators extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:sync-solana-validators';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    protected $rpcUrl = 'http://103.167.235.81:8899';


    /**
     * Execute the console command.
     */
    public function handle()
    {
        Log::info('Task executed at: ' . now());
        $this->info('Start upsert validators validators!');

        // Данные для отправки
        $data = [
            'jsonrpc' => '2.0',
            'id' => 1,
            'method' => 'getVoteAccounts',
            'params' => [
                ['commitment' => 'confirmed']
            ]
        ];


        // Инициализация cURL
        $ch = curl_init('http://103.167.235.81:8899');

        // Настройка параметров cURL
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

        // Выполнение запроса
        $response = curl_exec($ch);

        // Проверка на ошибки
        if (curl_errno($ch)) {
            echo 'cURL Error: ' . curl_error($ch);
            curl_close($ch);
            return;
        } else {
            curl_close($ch);
            // Parse the JSON response
            $jsonData = json_decode($response, true);
        }
        $currentValidators = $jsonData['result']['current'] ?? [];
        $delinquentValidators = $jsonData['result']['delinquent'] ?? [];

        // Об'єднуємо обидва списки з RPC для аналізу
        $allRpcValidators = array_merge(
            array_map(fn($v) => array_merge($v, ['is_rpc_delinquent' => false]), $currentValidators),
            array_map(fn($v) => array_merge($v, ['is_rpc_delinquent' => true]), $delinquentValidators)
        );
        $activeNodes = [];
        foreach ($allRpcValidators as $node) {
            $epochCredits = $node['epochCredits'] ?? [];
            if (empty($epochCredits)) {
                continue;
            }

            // Останній елемент масиву — поточна епоха [epoch, credits, previousCredits]
            $lastEpochData = end($epochCredits);
            $creditsInCurrentEpoch = $lastEpochData[1] - $lastEpochData[2];

            // ❌ ГОЛОВНЕ ПРАВИЛО: Мертві душі (0 кредитів) ігноруємо
            if ($creditsInCurrentEpoch <= 0) {
                continue;
            }

            // 💡 Плашка Delinquent ставить ТІЛЬКИ якщо нода пройшла фільтр кредитів > 0
            $activeNodes[] = [
                'vote_pubkey' => $node['votePubkey'],
                'node_pubkey' => $node['nodePubkey'],
                'activated_stake' => $node['activatedStake'],
                'credits_current_epoch' => $creditsInCurrentEpoch,
                'delinquent' => $node['is_rpc_delinquent'], // Плашка тільки для активних!
                'commission' => $node['commission'],
            ];
        }

        // Записуємо очищений список у КЕШ або оновлюємо в БД
        $jsonData = json_encode($activeNodes);

        // Викликаємо Postgres функцію скопом за 1 запит
        DB::statement("SELECT data.sync_solana_validators(?::jsonb)", [$jsonData]);
        $this->info('Upsert validators validators completed!');

//        dd($jsonData['result']);

    }
}
