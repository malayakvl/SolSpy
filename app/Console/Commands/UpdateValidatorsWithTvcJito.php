<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class UpdateValidatorsWithTvcJito extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'validators:update-tvc-jito';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update validators with TVC and Jito calculations';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        try {
            $this->info('Fetching validator data from Solana RPC...');
            
            // Get current slot
            $slotResponse = Http::post(config('services.solana.rpc_url', 'http://api.mainnet-beta.solana.com'), [
                'jsonrpc' => '2.0',
                'id' => 1,
                'method' => 'getSlot',
            ]);
            
            $currentSlot = $slotResponse->json('result');
            
            if (!$currentSlot) {
                $this->error('Failed to get current slot');
                return 1;
            }
            
            $this->info("Current slot: {$currentSlot}");
            
            // Get validator data
            $validatorsResponse = Http::post(config('services.solana.rpc_url', 'http://api.mainnet-beta.solana.com'), [
                'jsonrpc' => '2.0',
                'id' => 1,
                'method' => 'getVoteAccounts',
            ]);
            
            if (!$validatorsResponse->successful()) {
                $this->error('Failed to fetch validator data');
                return 1;
            }
            
            $validatorData = $validatorsResponse->json();
            
            $this->info('Updating validators with TVC and Jito calculations...');
            
            // Call the PostgreSQL function
            DB::select('SELECT data.update_validators_common_with_tvc_jito(?, ?)', [
                json_encode($validatorData),
                $currentSlot
            ]);
            
            $this->info('Validators updated successfully!');
            
            // Show some statistics
            $totalValidators = DB::select('SELECT COUNT(*) as count FROM data.validators')[0]->count;
            $validatorsWithTvc = DB::select('SELECT COUNT(*) as count FROM data.validators WHERE tvc_score IS NOT NULL')[0]->count;
            $validatorsWithJito = DB::select('SELECT COUNT(*) as count FROM data.validators WHERE jito_score IS NOT NULL')[0]->count;
            
            $this->info("Total validators: {$totalValidators}");
            $this->info("Validators with TVC score: {$validatorsWithTvc}");
            $this->info("Validators with Jito score: {$validatorsWithJito}");
            
            return 0;
        } catch (\Exception $e) {
            $this->error('Error updating validators: ' . $e->getMessage());
            return 1;
        }
    }
}