<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class fetchClusterNodes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fetch-cluster-nodes';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch Cluster nodes';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        //
        // Ваша логика задачи здесь
        Log::info('Task executed at: ' . now());
        $this->info('Start fetching clusters!');

        // Данные для отправки
        $data = [
            'jsonrpc' => '2.0',
            'id' => 1,
            'method' => 'getClusterNodes'
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
        $data = json_decode($response);
//        dd($data->result);exit;
        foreach ($data->result as $_data) {
//            dd($_data->pubkey);exit;
            if ($_data->pubkey === 'beefKGBWeSpHzYBHZXwp5So7wdQGX6mu4ZHCsH3uTar') {
                dd(1);exit;
            }
        }
        exit;
        // Проверка на ошибки
        if (curl_errno($ch)) {
            echo 'cURL Error: ' . curl_error($ch);
        } else {
            $query = "SELECT data.update_validators_common('$response'::jsonb);";
            DB::statement($query);
        }
        echo "All validators was updated";
        // Закрытие cURL
        curl_close($ch);

    }
}