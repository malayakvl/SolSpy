<?php

namespace App\Console\Commands\NOTUSED;

use App\Console\Commands\Exception;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class fechValidatorsStaticInfoStakewiz extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fech-validators-static-stakewiz-info';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch validators static info';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        //
        \Log::info('Task executed at: ' . now());
        $this->info('Start fetching validators static info!');

        try {
            $response = Http::get('https://api.stakewiz.com/validators');
            if ($response->failed()) {
                echo "API request failed" . $response->status() . "\n";
            }

            $data = $response->json();
            foreach ($data as $result) {
                $asn = DB::getPdo()->quote($result['ip_asn']);
                $city = DB::getPdo()->quote($result['ip_city']);
                $country = DB::getPdo()->quote($result['ip_country']);
                $org = DB::getPdo()->quote($result['ip_org']);
                $varsion = DB::getPdo()->quote($result['version']);
                $query = ('UPDATE validators SET
                        ip_asn = '.$asn. ',
                        ip_city = '.$city. ',
                        ip_country = '.$country. ',
                        ip_org = '.$org. ',
                        rank = '.$result['rank']. ',
                        epoch = '.$result['epoch']. ',
                        last_vote = '.$result['last_vote']. ',
                        version = '.$varsion. ',
                        is_jito = '.($result['is_jito'] ? $result['is_jito'] : 0). ',
                        jito_commission_bps = '.$result['jito_commission_bps']. ',
                        credits = '.$result['credits']. ',
                        epoch_credits = '.$result['epoch_credits']. ',
                        commission = '.$result['commission']. ',
                        root_slot = '.$result['root_slot']. '
                      WHERE vote_pubkey = \'' .$result['vote_account'].'\' OR node_pubkey = \'' .$result['vote_identity'].'\'
                ');
//                echo $query."\n";

                DB::statement($query);
            }
            echo "API request failed for update validators done\n";


            echo "All records processed successfully!\n";

        } catch (Exception $e) {
            echo "Error: " . $e->getMessage() . "\n";
        }
    }
}
