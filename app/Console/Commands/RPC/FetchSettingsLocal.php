<?php

namespace App\Console\Commands\Rpc;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class FetchSettingsLocal extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'rpc:fetch-settings-local';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch settings local';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        Log::info('Command app:fetch-settings executed at ' . now());
        $this->info('Start fetching settings info!');

        try {
            $url = "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd";
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            $response = curl_exec($ch);
            curl_close($ch);
            $data = json_decode($response, true);

            $query = ('UPDATE data.settings SET sol_rate=' .$data['solana']['usd']);
            DB::statement($query);

            $url = 'http://103.167.235.81:8899';
            // JSON payload for getEpochInfo
            $payload = [
                'jsonrpc' => '2.0',
                'id' => 1,
                'method' => 'getEpochInfo',
            ];

            // Initialize cURL
            $ch = curl_init($url);

            // Set cURL options
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

            // Execute cURL request
            $response = curl_exec($ch);
            // Check for errors
            if (curl_errno($ch)) {
                echo 'Error: ' . curl_error($ch);
            } else {
                // Output the response
                $_result = json_decode($response);
                
                // Get the epoch info data
                $absoluteSlot = $_result->result->absoluteSlot;
                $blockHeight = $_result->result->blockHeight;
                $epoch = $_result->result->epoch;
                $slotIndex = $_result->result->slotIndex;
                $slotsInEpoch = $_result->result->slotsInEpoch;
                $transactionCount = $_result->result->transactionCount;
                
                // Calculate additional values to match server version
                // Epoch Slot Range: [374976000..375408000) - start and end slots
                $epochStartSlot = $absoluteSlot - $slotIndex;
                $epochEndSlot = $epochStartSlot + $slotsInEpoch;
                
                // Epoch Completed Percent
                $epochCompletedPercent = 0.00;
                if ($slotsInEpoch > 0) {
                    $epochCompletedPercent = ($slotIndex / $slotsInEpoch) * 100;
                }
                
                // Epoch Completed Slots: 298099/432000 (133901 remaining)
                $remainingSlots = $slotsInEpoch - $slotIndex;
                
                // Try to get time-based information
                // We can estimate time based on average slot time
                // Solana has approximately 400ms per slot
                $slotTimeMs = 400; // milliseconds per slot
                
                // Calculate time durations
                $completedTimeMs = $slotIndex * $slotTimeMs;
                $totalTimeMs = $slotsInEpoch * $slotTimeMs;
                $remainingTimeMs = $remainingSlots * $slotTimeMs;
                
                // Convert milliseconds to human readable format
                $completedTimeFormatted = $this->formatMilliseconds($completedTimeMs);
                $totalTimeFormatted = $this->formatMilliseconds($totalTimeMs);
                $remainingTimeFormatted = $this->formatMilliseconds($remainingTimeMs);
                
                // Use Laravel's query builder to properly escape values
                DB::table('data.settings')->update([
                    'absolute_slot' => $absoluteSlot,
                    'block_height' => $blockHeight,
                    'epoch' => $epoch,
                    'slot_index' => $slotIndex,
                    'slot_in_epoch' => $slotsInEpoch,
                    'transaction_count' => $transactionCount,
                    'epoch_completed_percent' => $epochCompletedPercent,
                    'epoch_completed_time' => $completedTimeFormatted,
                    'epoch_total_time' => $totalTimeFormatted,
                    'epoch_remaining_time' => $remainingTimeFormatted
                ]);
                
                $this->info('Update time to '.$absoluteSlot);
                $this->info("Epoch completed: " . number_format($epochCompletedPercent, 2) . "%");
                $this->info("Epoch Slot Range: [{$epochStartSlot}..{$epochEndSlot})");
                $this->info("Epoch Completed Slots: {$slotIndex}/{$slotsInEpoch} ({$remainingSlots} remaining)");
                $this->info("Epoch Completed Time: {$completedTimeFormatted}/{$totalTimeFormatted} ({$remainingTimeFormatted} remaining)");
            }
            curl_close($ch);
        } catch (Exception $e) {
            echo "Error: " . $e->getMessage() . "\n";
        }
    }
    
    /**
     * Format milliseconds to human readable time format
     */
    private function formatMilliseconds($milliseconds)
    {
        $seconds = floor($milliseconds / 1000);
        $minutes = floor($seconds / 60);
        $seconds = $seconds % 60;
        $hours = floor($minutes / 60);
        $minutes = $minutes % 60;
        $days = floor($hours / 24);
        $hours = $hours % 24;
        
        $parts = [];
        if ($days > 0) {
            $parts[] = $days . 'day' . ($days != 1 ? 's' : '');
        }
        if ($hours > 0) {
            $parts[] = $hours . 'h';
        }
        if ($minutes > 0) {
            $parts[] = $minutes . 'm';
        }
        // if ($seconds > 0) {
        //     $parts[] = $seconds . 's';
        // }
        
        return !empty($parts) ? implode(' ', $parts) : '0s';
    }
}