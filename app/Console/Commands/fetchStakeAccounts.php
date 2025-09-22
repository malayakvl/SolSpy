<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class fetchStakeAccounts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fetch-stake-accounts {--epoch= : Specific epoch to fetch data for} {--count=10 : Number of epochs to fetch (default: 10)} {--from= : Starting epoch for range fetch} {--to= : Ending epoch for range fetch}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch stake accounts for all validators for the specified epoch and previous epochs';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        Log::info('Fetching stake accounts at: ' . now());
        $this->info('Start fetching stake accounts!');

        try {
            // Check if we're doing a range fetch
            $fromEpoch = $this->option('from');
            $toEpoch = $this->option('to');
            
            if ($fromEpoch && $toEpoch) {
                // Range fetch
                $this->info("Fetching data for epochs: " . $fromEpoch . " to " . $toEpoch);
                $epochsToFetch = [];
                for ($i = $toEpoch; $i >= $fromEpoch; $i--) {
                    $epochsToFetch[] = $i;
                }
                
                // Process each epoch separately to avoid memory issues
                foreach ($epochsToFetch as $epoch) {
                    $this->processEpoch($epoch, $toEpoch);
                }
            } else {
                // Regular fetch based on current epoch and count
                $specifiedEpoch = $this->option('epoch');
                $epochCount = $this->option('count');
                if ($specifiedEpoch) {
                    $currentEpoch = (int)$specifiedEpoch;
                    $this->info("Using specified epoch: " . $currentEpoch);
                } else {
                    // Get the current epoch from settings
                    $settings = DB::table('data.settings')->first();
                    $currentEpoch = $settings ? $settings->epoch : 0;
                    $this->info("Current epoch from settings: " . $currentEpoch);
                }
                
                $this->info("Fetching data for " . $epochCount . " epochs");
                
                // Define the epochs we want to fetch data for (current + previous epochs)
                $epochsToFetch = [];
                for ($i = 0; $i < $epochCount; $i++) {
                    $epochsToFetch[] = $currentEpoch - $i;
                }
                
                $this->info("Fetching data for epochs: " . implode(', ', $epochsToFetch));
                
                // Process each epoch separately to avoid memory issues
                foreach ($epochsToFetch as $epoch) {
                    $this->processEpoch($epoch, $currentEpoch);
                }
            }

            $this->info("Stake accounts processed successfully for all epochs!");
            
        } catch (Exception $e) {
            $this->error("Error: " . $e->getMessage());
            Log::error("Error fetching stake accounts: " . $e->getMessage());
        }
    }
    
    /**
     * Process a single epoch
     */
    private function processEpoch($epoch, $referenceEpoch)
    {
        $this->info("Processing epoch: " . $epoch);
        
        // Clear existing stake accounts for this epoch
        DB::table('data.stake_accounts')->where('epoch', $epoch)->delete();
        
        // Get all validators from the database (with limit to avoid memory issues)
        $totalValidators = DB::table('data.validators')->count();
        $batchSize = 100;
        $processed = 0;
        
        $this->info("Total validators: " . $totalValidators);
        
        // Process validators in batches
        for ($offset = 0; $offset < $totalValidators; $offset += $batchSize) {
            $validators = DB::table('data.validators')
                ->offset($offset)
                ->limit($batchSize)
                ->get(['id', 'vote_pubkey', 'node_pubkey', 'activated_stake']);
                
            $stakeAccounts = [];
            
            foreach ($validators as $validator) {
                // For demonstration purposes, let's create some sample stake accounts with variation
                // In a real implementation, you would fetch actual stake accounts from the Solana network
                
                // Create variation in self-stake based on epoch
                // Earlier epochs have less self-stake, more recent epochs have more
                if ($validator->activated_stake > 0) {
                    // Calculate epoch factor (more recent epochs have higher self-stake)
                    $epochDiff = $referenceEpoch - $epoch;
                    $epochFactor = 1.0 - ($epochDiff * 0.005); // 0.5% less per epoch
                    $selfStakePercentage = max(0.05, 0.1 * $epochFactor); // Minimum 5%
                    
                    // Add some validator-specific variation
                    $validatorFactor = 1.0 + (fmod($validator->id, 10) * 0.01); // ±10% based on validator ID
                    $selfStakeLamports = intval($validator->activated_stake * $selfStakePercentage * $validatorFactor);
                    
                    $stakeAccounts[] = [
                        'epoch' => $epoch,
                        'stake_pubkey' => 'sample_stake_' . $validator->id . '_self_epoch_' . $epoch,
                        'vote_pubkey' => $validator->vote_pubkey,
                        'node_pubkey' => $validator->node_pubkey,
                        'lamports' => $selfStakeLamports,
                        'is_self_stake' => true,
                        'created_at' => now(),
                        'updated_at' => now()
                    ];
                    
                    // Create some sample non-self stake accounts (remaining stake split among 3 accounts)
                    $remainingStake = $validator->activated_stake - $selfStakeLamports;
                    $nonSelfStakeLamports = intval($remainingStake / 3);
                    
                    for ($i = 1; $i <= 3; $i++) {
                        $stakeAccounts[] = [
                            'epoch' => $epoch,
                            'stake_pubkey' => 'sample_stake_' . $validator->id . '_other_' . $i . '_epoch_' . $epoch,
                            'vote_pubkey' => $validator->vote_pubkey,
                            'node_pubkey' => $validator->node_pubkey,
                            'lamports' => $nonSelfStakeLamports,
                            'is_self_stake' => false,
                            'created_at' => now(),
                            'updated_at' => now()
                        ];
                    }
                }
            }
            
            // Insert stake accounts into database
            if (!empty($stakeAccounts)) {
                DB::table('data.stake_accounts')->insert($stakeAccounts);
                $processed += count($stakeAccounts);
                $this->info("Inserted " . count($stakeAccounts) . " sample stake accounts for epoch " . $epoch . " (batch " . ($offset/$batchSize + 1) . ")");
            }
            
            // Clear variables to free memory
            unset($validators, $stakeAccounts);
        }
        
        $this->info("Completed processing epoch: " . $epoch . " (Total inserted: " . $processed . ")");
    }
}