<?php

namespace App\Console\Commands\Validators;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FetchValidators extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fetch-validators';

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
        
        // Проверка на ошибки
        if (curl_errno($ch)) {
            echo 'cURL Error: ' . curl_error($ch);
            curl_close($ch);
            return;
        } else {
            curl_close($ch);
            // Parse the JSON response
            $jsonData = json_decode($response, true);
            // Check if response structure is valid
            if (isset($jsonData['result'])) {
                // Log the response structure
                echo "Processing validators. Current count: " . (isset($jsonData['result']['current']) ? count($jsonData['result']['current']) : 0) . "\n";
                echo "Delinquent count: " . (isset($jsonData['result']['delinquent']) ? count($jsonData['result']['delinquent']) : 0) . "\n";
                
                // Get current slot for TVR calculation
                $currentSlot = $this->getCurrentSlot();
                
                // Pass the entire response to the database function with current slot
                if ($currentSlot) {
                    // $query = "SELECT data.update_validators_common_with_tvc('$response'::jsonb, $currentSlot);";
                    $query = "SELECT data.update_validators_common_with_tvc_jito('$response'::jsonb, $currentSlot);";
                } else {
                    // Fallback to original function if slot retrieval fails
                    // $query = "SELECT data.update_validators_common_with_tvc('$response'::jsonb, NULL);";
                    $query = "SELECT data.update_validators_common_with_tvc_jito('$response'::jsonb, NULL);";
                }
                DB::statement($query);
            } else {
                echo "Invalid response structure - no 'result' key found\n";
            }
        }
        $this->info('All validators was updated');
    }

    private function getCurrentSlot()
    {
        $data = [
            'jsonrpc' => '2.0',
            'id' => 1,
            'method' => 'getSlot'
        ];

        $ch = curl_init('http://103.167.235.81:8899');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

        $response = curl_exec($ch);
        if (curl_errno($ch)) {
            $this->error('cURL Error (getSlot): ' . curl_error($ch));
            curl_close($ch);
            return null;
        }
        curl_close($ch);

        $jsonData = json_decode($response, true);
        return $jsonData['result'] ?? null;
    }
}