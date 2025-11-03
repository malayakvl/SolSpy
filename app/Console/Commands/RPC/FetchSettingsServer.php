<?php

namespace App\Console\Commands\Rpc;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Process;
use Illuminate\Support\Facades\DB;
use Exception;

class FetchSettingsServer extends Command
{
    protected $signature = 'rpc:fetch-settings-server';
    protected $description = 'Update validator settings from Solana CLI';

    public function handle()
    {
        $this->info("Updating settings");
        Log::channel('cron-settings')->info('Starting rpc:fetch-settings-server', [
            'user' => get_current_user(),
            'pid' => getmypid()
        ]);
        
        try {
            $solanaPath = "/usr/local/bin/solana";
            
            // Check if the solana binary exists
            if (!file_exists($solanaPath)) {
                Log::channel('cron-settings')->error('Solana binary not found', ['path' => $solanaPath]);
                $this->error('Solana binary not found at ' . $solanaPath);
                return 1;
            }
            
            Log::channel('cron-settings')->debug('Using Solana binary', ['path' => $solanaPath]);
            
            // Execute the command to get epoch info
            $command = "$solanaPath epoch-info";
            Log::channel('cron-settings')->debug('Executing command', ['command' => $command]);
            $process = Process::fromShellCommandline($command, null, null, null, 120);
            $process->run();
            
            if (!$process->isSuccessful()) {
                Log::channel('cron-settings')->error('Command failed', [
                    'command' => $command,
                    'error' => $process->getErrorOutput(),
                    'exit_code' => $process->getExitCode()
                ]);
                $this->error('Command failed: ' . $process->getErrorOutput());
                return 1;
            }
            
            $output = $process->getOutput();
            Log::channel('cron-settings')->debug('Command output', ['output' => $output]);
            
            if (empty($output)) {
                Log::channel('cron-settings')->error('Command returned empty output');
                $this->error('Command returned empty output');
                return 1;
            }
            
            // Parse the output
            $lines = explode("\n", trim($output));
            Log::channel('cron-settings')->debug('Parsed lines', ['lines' => $lines]);
            
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
            
            foreach ($lines as $line) {
                $parts = explode(':', $line, 2);
                if (count($parts) == 2) {
                    $key = trim($parts[0]);
                    $value = trim($parts[1]);
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
                            if (preg_match('/(\d+)\/(\d+)/', $value, $matches)) {
                                $slotIndex = (int)$matches[1];
                                $slotsInEpoch = (int)$matches[2];
                            }
                            break;
                        case 'Remaining time':
                            $epochRemainingTime = $value;
                            // Remove seconds from the time format (e.g., "1day 13h 20m 29s" becomes "1day 13h 20m")
                            $epochRemainingTime = preg_replace('/\s+\d+s$/', '', $epochRemainingTime);
                            break;
                        case 'Epoch Completed Time':
                            if (preg_match('/^(.*?)\/(.*?)\s*\((.*?)\s+remaining\)$/', $value, $timeMatches)) {
                                $epochCompletedTime = $timeMatches[1];
                                $epochTotalTime = $timeMatches[2];
                                $epochRemainingTime = $timeMatches[3];
                                // Remove seconds from the time format (e.g., "1day 13h 20m 29s" becomes "1day 13h 20m")
                                $epochRemainingTime = preg_replace('/\s+\d+s$/', '', $epochRemainingTime);
                            }
                            break;
                    }
                }
            }
            
            Log::channel('cron-settings')->debug('Parsed values', [
                'absoluteSlot' => $absoluteSlot,
                'blockHeight' => $blockHeight,
                'epoch' => $epoch,
                'slotIndex' => $slotIndex,
                'slotsInEpoch' => $slotsInEpoch,
                'transactionCount' => $transactionCount,
                'epochCompletedPercent' => $epochCompletedPercent
            ]);
            
            if ($epochCompletedPercent === null && $slotsInEpoch !== null && $slotsInEpoch > 0 && $slotIndex !== null) {
                $epochCompletedPercent = ($slotIndex / $slotsInEpoch) * 100;
            }
            
            if ($absoluteSlot !== null && $blockHeight !== null && $epoch !== null && 
                $slotIndex !== null && $slotsInEpoch !== null && $transactionCount !== null) {
                
                Log::channel('cron-settings')->debug('Updating database');
                $test = DB::select("SELECT absolute_slot FROM data.settings LIMIT 1");
                Log::channel('cron-settings')->debug('Current database value', ['test' => $test]);
                
                DB::statement("
                    UPDATE data.settings 
                    SET 
                        absolute_slot = :absolute_slot,
                        block_height = :block_height,
                        epoch = :epoch,
                        slot_index = :slot_index,
                        slot_in_epoch = :slot_in_epoch,
                        transaction_count = :transaction_count,
                        epoch_completed_percent = :epoch_completed_percent,
                        epoch_completed_time = :epoch_completed_time,
                        epoch_total_time = :epoch_total_time,
                        epoch_remaining_time = :epoch_remaining_time,
                        updated_at = NOW()
                ", [
                    'absolute_slot' => $absoluteSlot,
                    'block_height' => $blockHeight,
                    'epoch' => $epoch,
                    'slot_index' => $slotIndex,
                    'slot_in_epoch' => $slotsInEpoch,
                    'transaction_count' => $transactionCount,
                    'epoch_completed_percent' => $epochCompletedPercent,
                    'epoch_completed_time' => $epochCompletedTime,
                    'epoch_total_time' => $epochTotalTime,
                    'epoch_remaining_time' => $epochRemainingTime,
                ]);
                
                Log::channel('cron-settings')->info('Settings updated successfully in database');
                $this->info('Settings updated successfully!');
                $this->info("Epoch completed: " . number_format($epochCompletedPercent, 2) . "%");
                $this->info("Completed time: " . $epochCompletedTime);
                $this->info("Total time: " . $epochTotalTime);
                $this->info("Remaining time: " . $epochRemainingTime);
            } else {
                Log::channel('cron-settings')->error('Failed to parse all required values from epoch-info output', ['output' => $output]);
                $this->error('Failed to parse all required values from epoch-info output');
                return 1;
            }
            
            return 0;
        } catch (\Exception $e) {
            Log::channel('cron-settings')->error('Error updating validator settings', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            $this->error('Error updating validator settings: ' . $e->getMessage());
            return 1;
        }
    }
}