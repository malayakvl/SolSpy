<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use phpseclib3\Net\SSH2;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UpdateValidatorScoresLocal extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'validators:update-scores-local {collectLength=3 : Number of collections to keep}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update validator scores from Solana CLI via SSH (for local development)';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $collectLength = (int) $this->argument('collectLength');
        $this->info("Updating validator scores via SSH (keeping last $collectLength collections)...");
        
        try {
            // Connect to remote server
            $ssh = new SSH2(env('VALIDATOR_SERVER_HOST', '103.167.235.81'));
            $ssh->setTimeout(30);
            
            $loginSuccess = $ssh->login(
                env('VALIDATOR_SERVER_USER', 'root'), 
                env('VALIDATOR_SERVER_PASSWORD')
            );
            
            if (!$loginSuccess) {
                $this->error('SSH login failed');
                return 1;
            }
            
            $this->info('SSH connection established');
            
            // Use the confirmed working path for solana command
            $solanaPath = "/usr/local/bin/solana";
            
            // Execute the command to get all validators
            $command = "$solanaPath validators -um --sort=credits -r -n";
            $output = $ssh->exec($command);
            $exitStatus = $ssh->getExitStatus();
            
            if ($exitStatus !== 0 || empty($output)) {
                $this->error('Command failed with exit status: ' . $exitStatus);
                return 1;
            }
            
            // Parse the output
            $lines = explode("\n", trim($output));
            $validators = [];
            
            foreach ($lines as $line) {
                $parts = preg_split('/\s+/', trim($line));
                if (count($parts) >= 17 && is_numeric($parts[0])) {
                    $validators[] = [
                        'rank' => (int)$parts[0],
                        'node_pubkey' => $parts[2],
                        'vote_pubkey' => $parts[3],
                        'uptime' => $parts[4],
                        'root_slot' => (int)str_replace(['(', ')'], '', $parts[5]),
                        'vote_slot' => (int)str_replace(['(', ')'], '', $parts[8]),
                        'commission' => (float)str_replace('%', '', $parts[11]),
                        'credits' => (int)$parts[12],
                        'version' => $parts[13],
                        'stake' => $parts[14],
                        'stake_percent' => str_replace(['(', ')', '%'], '', $parts[16]),
                        'collected_at' => now(),
                        'created_at' => now(),
                        'updated_at' => now()
                    ];
                }
            }
            
            $this->info('Found ' . count($validators) . ' validators');
            
            // Insert new data without truncating
            DB::transaction(function () use ($validators) {
                // Insert in batches to avoid memory issues
                $chunks = array_chunk($validators, 100);
                foreach ($chunks as $chunk) {
                    DB::table('data.validator_scores')->insert($chunk);
                }
            });
            
            // Clean up old data (keep only the specified number of collections)
            $this->cleanupOldData($collectLength);
            
            $ssh->disconnect();
            
            $this->info('Validator scores updated successfully via SSH!');
            
            return 0;
        } catch (\Exception $e) {
            $this->error('Error updating validator scores: ' . $e->getMessage());
            Log::error('Error updating validator scores via SSH: ' . $e->getMessage(), ['exception' => $e]);
            return 1;
        }
    }
    
    /**
     * Clean up old data, keeping only the specified number of collections
     */
    private function cleanupOldData($collectLength)
    {
        // Get the distinct collection times, ordered by newest first
        $collections = DB::table('data.validator_scores')
            ->select('collected_at')
            ->groupBy('collected_at')
            ->orderBy('collected_at', 'desc')
            ->limit($collectLength)
            ->pluck('collected_at');
        
        // If we have more than the specified number of collections, delete the oldest ones
        if ($collections->count() >= $collectLength) {
            $oldestToKeep = $collections->last();
            $deleted = DB::table('data.validator_scores')
                ->where('collected_at', '<', $oldestToKeep)
                ->delete();
                
            if ($deleted > 0) {
                $this->info("Cleaned up old data, deleted $deleted records. Keeping collections from " . $oldestToKeep);
            }
        }
    }
}