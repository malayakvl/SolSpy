<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class FetchSettings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fetch-settings';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch settings';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        Log::info('Command app:fetch-settings executed at ' . now());
        $this->info('Start fetching settings info!');

        try {
            $url = "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd";
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            $response = curl_exec($ch);
            curl_close($ch);
            $data = json_decode($response, true);

            $query = ('UPDATE settings SET sol_rate=' .$data['solana']['usd']);
            DB::statement($query);

            $url = 'http://103.167.235.81:8899';
            // JSON payload
            $payload = [
                'jsonrpc' => '2.0',
                'id' => 1,
                'method' => 'getEpochInfo',
                'params' => [
                    [
                        'commitment' => 'finalized'
                    ]
                ]
            ];

            // Initialize cURL
            $ch = curl_init($url);

            // Set cURL options
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

            // Execute cURL request
            $response = curl_exec($ch);
//dd($response);exit;
            // Check for errors
            if (curl_errno($ch)) {
                echo 'Error: ' . curl_error($ch);
            } else {
                // Output the response
                $_result = json_decode($response);
                $query = ('UPDATE settings SET 
                    absolute_slot=' .$_result->result->absoluteSlot.', 
                    block_height=' .$_result->result->blockHeight.', 
                    epoch=' .$_result->result->epoch.', 
                    slot_index=' .$_result->result->slotIndex.', 
                    slot_in_epoch=' .$_result->result->slotsInEpoch.', 
                    transaction_count=' .$_result->result->transactionCount.'
                ');
                DB::statement($query);
                $this->info('Update time to '.$_result->result->absoluteSlot);
            }
        } catch (Exception $e) {
            echo "Error: " . $e->getMessage() . "\n";
        }
    }
}
