<?php

namespace App\Console\Commands\Rpc;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Process;
use Illuminate\Support\Facades\DB;
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
            
            // Execute the command to get epoch info
            $command = "$solanaPath epoch-info";
            
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
            
            // Initialize variables to store parsed values
            $absoluteSlot = null;
            $blockHeight = null;
            $epoch = null;
            $slotIndex = null;
            $slotsInEpoch = null;
            $transactionCount = null;
            $epochCompletedPercent = null;
            $epochCompletedTime = '';
            $epochTotalTime = '';
            $epochRemainingTime = '';
            
            // Parse each line of the output
            foreach ($lines as $line) {
                $parts = explode(':', $line, 2);
                if (count($parts) == 2) {
                    $key = trim($parts[0]);
                    $value = trim($parts[1]);
                    
                    // Remove commas from numbers for proper parsing
                    $value = str_replace(',', '', $value);
                    
                    switch ($key) {
                        case 'Slot':
                            $absoluteSlot = (int)$value;
                            break;
                        case 'Epoch':
                            $epoch = (int)$value;
                            break;
                        case 'Transaction Count':
                            $transactionCount = (int)$value;
                            break;
                        case 'Epoch Completed Percent':
                            $epochCompletedPercent = floatval($value);
                            break;
                        case 'Block height':
                            $blockHeight = (int)$value;
                            break;
                        case 'Epoch Completed Slots':
                            // Parse the format: "298099/432000 (133901 remaining)"
                            if (preg_match('/(\d+)\/(\d+)/', $value, $matches)) {
                                $slotIndex = (int)$matches[1];     // 298099
                                $slotsInEpoch = (int)$matches[2];  // 432000
                            }
                            break;
                        case 'Epoch Completed Time':
                            // Parse the format: "1day 9h 31m 26s/1day 23h 45m 6s (14h 13m 40s remaining)"
                            // Extract the three time components
                            if (preg_match('/^(.*?)\/(.*?)\s*\((.*?)\s+remaining\)$/', $value, $timeMatches)) {
                                $epochCompletedTime = $timeMatches[1];   // 1day 9h 31m 26s
                                $epochTotalTime = $timeMatches[2];       // 1day 23h 45m 6s
                                $epochRemainingTime = $timeMatches[3];   // 14h 13m 40s
                            }
                            break;
                    }
                }
            }
            
            // Block height is typically slot - slotIndex
            // if ($absoluteSlot !== null && $slotIndex !== null) {
            //     $blockHeight = $absoluteSlot - $slotIndex;
            // }
            
            // Calculate epoch completed percent if not provided
            if ($epochCompletedPercent === null && $slotsInEpoch !== null && $slotsInEpoch > 0 && $slotIndex !== null) {
                $epochCompletedPercent = ($slotIndex / $slotsInEpoch) * 100;
            }

            
            // Update the settings table with parsed values
            if ($absoluteSlot !== null && $blockHeight !== null && $epoch !== null && 
                $slotIndex !== null && $slotsInEpoch !== null && $transactionCount !== null) {
                
                // Use Laravel's query builder to properly escape values
                DB::table('data.settings')->update([
                    'absolute_slot' => $absoluteSlot,
                    'block_height' => $blockHeight,
                    'epoch' => $epoch,
                    'slot_index' => $slotIndex,
                    'slot_in_epoch' => $slotsInEpoch,
                    'transaction_count' => $transactionCount,
                    'epoch_completed_percent' => $epochCompletedPercent,
                    'epoch_completed_time' => $epochCompletedTime,
                    'epoch_total_time' => $epochTotalTime,
                    'epoch_remaining_time' => $epochRemainingTime
                ]);
                
                $this->info('Settings updated successfully!');
                $this->info("Epoch completed: " . number_format($epochCompletedPercent, 2) . "%");
                $this->info("Completed time: " . $epochCompletedTime);
                $this->info("Total time: " . $epochTotalTime);
                $this->info("Remaining time: " . $epochRemainingTime);
            } else {
                $this->error('Failed to parse all required values from epoch-info output');
                return 1;
            }
            
            return 0;
        } catch (\Exception $e) {
            $this->error('Error updating validator settings: ' . $e->getMessage());
            Log::error('Error updating validator settings: ' . $e->getMessage(), ['exception' => $e]);
            return 1;
        }
    }
}