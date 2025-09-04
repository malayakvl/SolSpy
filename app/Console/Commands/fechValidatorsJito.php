<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class fechValidatorsJito extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fech-validators-jito';

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

            
            
            // dd($data['validators'][0]);exit;
            $updResult = [
                "result" => ["current" => ($data['validators'])],
            ];
            $response = json_encode($updResult);
            $responseStripped = preg_replace("/(?<!\\\\)'/", '`', $response);

            $query = "SELECT data.update_validators_jiito('$responseStripped'::jsonb);";
            DB::statement($query);
            $this->info('Executing query with improved error handling...');
            
            // Check how many validators will be affected
            // $voteAccounts = array_column($data['validators'], 'vote_account');
            // $existingCount = DB::table('data.validators')
            //     ->whereIn('vote_pubkey', $voteAccounts)
            //     ->count();
            
            // $this->info("Found $existingCount existing validators out of " . count($voteAccounts) . " from API");
            
            
            
            // // Verify the update worked
            // $updatedCount = DB::table('data.validators')
            //     ->whereIn('vote_pubkey', $voteAccounts)
            //     ->whereNotNull('jito_commission')
            //     ->count();
            
            // $this->info("Successfully updated jito_commission for $updatedCount validators");
            
            return;

        } catch (Exception $e) {
            // Обработка исключений (например, проблемы с сетью)
            $this->error("Error occurred: " . $e->getMessage());
        }
        
        $this->info('All jiito for validators was updated');

    }
}
