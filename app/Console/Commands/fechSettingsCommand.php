<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class fechSettingsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fech-settings';

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
        //
        \Log::info('Task executed at: ' . now());
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

            $url = 'https://api.devnet.solana.com';

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
                dd($_result->result->absoluteSlot);exit;
            }

//            $data = $response->json();
//            foreach ($data as $result) {
//                $asn = DB::getPdo()->quote($result['ip_asn']);
//                $city = DB::getPdo()->quote($result['ip_city']);
//                $country = DB::getPdo()->quote($result['ip_country']);
//                $org = DB::getPdo()->quote($result['ip_org']);
//                $varsion = DB::getPdo()->quote($result['version']);
//                $query = ('UPDATE validators SET
//                        ip_asn = '.$asn. ',
//                        ip_city = '.$city. ',
//                        ip_country = '.$country. ',
//                        ip_org = '.$org. ',
//                        rank = '.$result['rank']. ',
//                        epoch = '.$result['epoch']. ',
//                        last_vote = '.$result['last_vote']. ',
//                        version = '.$varsion. ',
//                        is_jito = '.($result['is_jito'] ? $result['is_jito'] : 0). ',
//                        jito_commission_bps = '.$result['jito_commission_bps']. ',
//                        credits = '.$result['credits']. ',
//                        epoch_credits = '.$result['epoch_credits']. ',
//                        commission = '.$result['commission']. ',
//                        root_slot = '.$result['root_slot']. ',
//                        activated_stake = '.$result['activated_stake']. '
//                      WHERE vote_pubkey = \'' .$result['vote_identity'].'\' OR node_pubkey = \'' .$result['vote_identity'].'\'
//                ');
////                echo $query."\n";
//
//                DB::statement($query);
//            }
            echo "All records processed successfully!\n";

        } catch (Exception $e) {
            echo "Error: " . $e->getMessage() . "\n";
        }
    }
}
