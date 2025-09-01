<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class fechValidatorsMainnet extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fech-validators-mainnet';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch validators marinade';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        \Log::info('Task executed at: ' . now());
        $this->info('Start fetching validators name!');

        try {
            $response = Http::withHeaders([
                'Token' => 'cmZs2kcAsJAXkUwc5gs2CHkW',
            ])->get("https://www.validators.app/api/v1/validators/mainnet.json");
            if ($response->failed()) {
                echo "API request failed" . $response->status() . "\n";
            }
            $data = $response->json();
            foreach ($data as $result) {
                $stats = json_encode($result['stake_pools_list']);
                DB::table('data.validators')
                    ->where('vote_pubkey', $result['vote_account'])
                    ->where('node_pubkey', $result['account'])
                    ->update([
                        'details' => $result['details'],
                        'network' => $result['network'],
                        'asn' => $result['autonomous_system_number'],
                        'jito' => $result['jito'],
                        'jito_commission' => $result['jito_commission'],
                        'stake_pools_list' => $stats,
                        'software_client' => $result['software_client'],
                        'avatar_file_url' => @$result['avatar_file_url'] ? $result['avatar_file_url'] : ''
                    ]);
            }

            echo "All records processed successfully!\n";

        } catch (Exception $e) {
            echo "Error: " . $e->getMessage() . "\n";
        }
    }
}
