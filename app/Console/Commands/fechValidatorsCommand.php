<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class fechValidatorsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fech-validators-command';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch Validators';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        //
        // Ваша логика задачи здесь
        \Log::info('Task executed at: ' . now());
        $this->info('Start fetching validators!');

        // Данные для отправки
        $data = [
            'jsonrpc' => '2.0',
            'id' => 1,
            'method' => 'getVoteAccounts'
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
        } else {
           // Обработка ответа
           $results = json_decode($response, true);
           foreach ($results["result"]["current"] as $result) {
               DB::statement(
                   'INSERT INTO validators (vote_pubkey, node_pubkey, created_at, updated_at)
                 VALUES (?, ?, NOW(), NOW())
                 ON CONFLICT (vote_pubkey, node_pubkey)
                 DO UPDATE SET
                     node_pubkey = EXCLUDED.node_pubkey,
                     vote_pubkey = EXCLUDED.vote_pubkey,
                     updated_at = NOW()',
                   [$result['votePubkey'], $result['nodePubkey']]
               );
           }
        }

        // Закрытие cURL
        curl_close($ch);

    }
}
