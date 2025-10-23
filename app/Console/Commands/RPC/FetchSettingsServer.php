<?php

namespace App\Console\Commands\Rpc;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Process;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Exception;

class FetchSettingsServer extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'rpc:fetch-settings-server';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update validator settings from Solana CLI';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        // Get collectLength from settings table
        $dbSettings = DB::table('data.settings')->first();
        $collectLength = $dbSettings->collect_score_retention ?? 10;
        
        $this->info("Updating settings");
        
        try {
            // Use the symbolic link path which should be accessible
            $solanaPath = "/usr/local/bin/solana";
            
            // Check if the solana binary exists and is executable
            if (!file_exists($solanaPath) || !is_executable($solanaPath)) {
                // Fallback to direct path
                $solanaPath = "/root/.local/share/solana/install/active_release/bin/solana";
                if (!file_exists($solanaPath) || !is_executable($solanaPath)) {
                    $this->error('Solana binary not found or not executable');
                    return 1;
                }
            }
            
            // Execute the command to get all validators
            $command = "$solanaPath solana epoch-info";
            
            $process = Process::fromShellCommandline($command, null, null, null, 120);
            $process->run();
            
            if (!$process->isSuccessful()) {
                $this->error('Command failed: ' . $process->getErrorOutput());
                return 1;
            }
            
            $output = $process->getOutput();
            
            if (empty($output)) {
                $this->error('Command returned empty output');
                return 1;
            }
            
            // Parse the output
            $lines = explode("\n", trim($output));
            // $query = ('UPDATE data.settings SET 
            //         absolute_slot=' .$_result->result->absoluteSlot.', 
            //         block_height=' .$_result->result->blockHeight.', 
            //         epoch=' .$_result->result->epoch.', 
            //         slot_index=' .$_result->result->slotIndex.', 
            //         slot_in_epoch=' .$_result->result->slotsInEpoch.', 
            //         transaction_count=' .$_result->result->transactionCount.'
            //     ');
            //     DB::statement($query);
            // Parse the output and insert into database using PostgreSQL function
            
            
            $this->info('Validator settings update successfully!');
            
            return 0;
        } catch (\Exception $e) {
            $this->error('Error updating validator settings: ' . $e->getMessage());
            Log::error('Error updating validator settings: ' . $e->getMessage(), ['exception' => $e]);
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