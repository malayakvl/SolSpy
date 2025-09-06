<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class fechValidators extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fech-validators';

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
        Log::info('Task executed at: ' . now());
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
// dd($response);exit;
        // Проверка на ошибки
        if (curl_errno($ch)) {
            echo 'cURL Error: ' . curl_error($ch);
        } else {
            // Parse the JSON response
            $jsonData = json_decode($response, true);
            // dd($response,);exit;
            // Check if response structure is valid
            if (isset($jsonData['result'])) {
                // Log the response structure
                echo "Processing validators. Current count: " . (isset($jsonData['result']['current']) ? count($jsonData['result']['current']) : 0) . "\n";
                echo "Delinquent count: " . (isset($jsonData['result']['delinquent']) ? count($jsonData['result']['delinquent']) : 0) . "\n";
                
                // Pass the entire response to the database function
                $query = "SELECT data.update_validators_common_history('$response'::jsonb);";
// echo $query;exit;   ssh root@103.167.235.81 -p 22              
                DB::statement($query);
            } else {
                echo "Invalid response structure - no 'result' key found\n";
            }
        }
//        echo "All validators was updated Each 5 second";
        $this->info('All validators was updated');
        // Закрытие cURL
        curl_close($ch);

    }
}