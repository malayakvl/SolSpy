<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CalculateTvcRanks extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tvc:calculate-ranks';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Calculate TVC ranks for all validators based on their TVC scores';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        try {
            $this->info('Calculating TVC ranks for all validators...');
            
            // Call the PostgreSQL function to calculate TVC ranks
            DB::select('SELECT data.calculate_tvc_ranks();');
            
            $this->info('TVC ranks calculated successfully!');
            
            // Show some statistics
            $rankedValidators = DB::select('SELECT COUNT(*) as count FROM data.validators WHERE tvc_rank IS NOT NULL')[0]->count;
            $totalValidators = DB::select('SELECT COUNT(*) as count FROM data.validators')[0]->count;
            
            $this->info("Ranked validators: {$rankedValidators}/{$totalValidators}");
            
            // Show top 5 validators
            $topValidators = DB::select('SELECT vote_pubkey, tvc_score, tvc_rank FROM data.validators WHERE tvc_rank IS NOT NULL ORDER BY tvc_rank ASC LIMIT 5');
            
            $this->info('Top 5 validators by TVC rank:');
            foreach ($topValidators as $validator) {
                $shortPubkey = substr($validator->vote_pubkey, 0, 20) . '...';
                $this->line("#{$validator->tvc_rank}: {$shortPubkey} (Score: {$validator->tvc_score})");
            }
            
            return 0;
        } catch (\Exception $e) {
            $this->error('Error calculating TVC ranks: ' . $e->getMessage());
            return 1;
        }
    }
}