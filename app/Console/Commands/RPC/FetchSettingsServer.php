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
                        case 'Epoch Slots':
                            // This line contains both slot index and slots in epoch
                            if (preg_match('/(\d+) completed, (\d+) remaining/', $line, $matches)) {
                                $slotIndex = (int)$matches[1];
                                $slotsInEpoch = (int)$matches[2] + (int)$matches[1]; // Total slots = completed + remaining
                            }
                            break;
                    }
                }
            }
            
            // Block height is typically slot - slotIndex
            if ($absoluteSlot !== null && $slotIndex !== null) {
                $blockHeight = $absoluteSlot - $slotIndex;
            }
            
            // Update the settings table with parsed values
            if ($absoluteSlot !== null && $blockHeight !== null && $epoch !== null && 
                $slotIndex !== null && $slotsInEpoch !== null && $transactionCount !== null) {
                
                $query = "UPDATE data.settings SET 
                    absolute_slot = $absoluteSlot,
                    block_height = $blockHeight,
                    epoch = $epoch,
                    slot_index = $slotIndex,
                    slot_in_epoch = $slotsInEpoch,
                    transaction_count = $transactionCount";
                dd($query);
                exit;
                DB::statement($query);
                $this->info('Settings updated successfully!');
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