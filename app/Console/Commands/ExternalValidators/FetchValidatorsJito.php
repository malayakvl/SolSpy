<?php

namespace App\Console\Commands\ExternalValidators;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class FetchValidatorsJito extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fetch-validators-jito';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch validators jiito';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        //
        Log::info('Task executed at: ' . now());
        $this->info('Start fetching validators static info!');
        $limit = 500; // Количество записей за один запрос
        $offset = 0; // Начальное смещение
        $allValidators = [];

        try {
            // Выполняем GET-запрос с текущими limit и offset
            $response = Http::get('https://kobe.mainnet.jito.network/api/v1/validators');
            // Проверяем, успешен ли запрос
            $data = $response->json();

            $updResult = [
                "result" => ["current" => ($data['validators'])],
            ];
            $response = json_encode($updResult);
            $responseStripped = preg_replace("/(?<!\\\\)'/", '`', $response);

            $query = "SELECT data.update_validators_jiito('$responseStripped'::jsonb);";
            DB::statement($query);
            $this->info('Executing query with improved error handling...');
            
            return;

        } catch (Exception $e) {
            // Обработка исключений (например, проблемы с сетью)
            $this->error("Error occurred: " . $e->getMessage());
        }
        
        $this->info('All jiito for validators was updated');

    }
}