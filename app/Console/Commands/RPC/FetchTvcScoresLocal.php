<?php

namespace App\Console\Commands\Rpc;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Exception;

class FetchTvcScoresLocal extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'rpc:fetch-tvc-scores-local';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch tvc scores from RPC';
    
    protected $rpcUrl = 'http://103.167.235.81:8899';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        Log::info('Command rpc:fetch-tvc-scores executed at ' . now());
        $this->info('Start fetching tvc scores info!');

        $this->info("Connecting to RPC: {$this->rpcUrl}");

        try {
            // First, get cluster nodes information to build version map
            $this->info("Fetching cluster nodes information...");
            $nodeData = $this->fetchClusterNodes();
            
            // Create version map: nodePubkey → version
            $versionMap = [];
            if (!empty($nodeData)) {
                foreach ($nodeData as $node) {
                    if (isset($node['pubkey'], $node['version'])) {
                        $versionMap[$node['pubkey']] = $node['version'];
                    }
                }
            }
            $this->info("Found versions for " . count($versionMap) . " nodes");
            
            // Then get vote accounts data
            $this->info("Fetching vote accounts...");
            $voteData = $this->fetchVoteAccounts();
            
            if (!$voteData) {
                echo "Failed to fetch vote accounts data\n";
                return 1;
            }
            
            // Get validators data
            $currentValidators = $voteData['current'] ?? [];
            $delinquentValidators = $voteData['delinquent'] ?? [];
            
            // Combine all validators
            $validators = array_merge($currentValidators, $delinquentValidators);
            
            // Sort validators by credits (using last epoch data)
            usort($validators, function($a, $b) {
                $aCredits = 0;
                $bCredits = 0;
                
                if (!empty($a['epochCredits'])) {
                    $lastEpoch = end($a['epochCredits']);
                    $aCredits = $lastEpoch[1] - $lastEpoch[2];
                }
                
                if (!empty($b['epochCredits'])) {
                    $lastEpoch = end($b['epochCredits']);
                    $bCredits = $lastEpoch[1] - $lastEpoch[2];
                }
                
                return $bCredits <=> $aCredits;
            });
            
            // Display header
            $header = '     Identity                                      Vote Account                            Commission  Last Vote        Root Slot     Skip Rate  Credits  Version            Active Stake';
            $this->line($header);
            
            // Prepare lines for output and file storage
            $lines = [];
            $lines[] = $header;
            
            // Display all validators and prepare file content
            for ($i = 0; $i < count($validators); $i++) {
                $v = $validators[$i];
                $identity = $v['nodePubkey'] ?? '';
                $vote = $v['votePubkey'] ?? '';
                
                // Get credits from last epoch
                $credits = 0;
                if (!empty($v['epochCredits'])) {
                    $lastEpoch = end($v['epochCredits']);
                    $credits = $lastEpoch[1] - $lastEpoch[2];
                }
                
                $lastVote = $v['lastVote'] ?? 0;
                $rootSlot = $v['rootSlot'] ?? 0;
                $commission = $v['commission'] ?? 0;
                $activatedStake = $v['activatedStake'] ?? 0;
                
                // Get version from our map
                $version = $versionMap[$identity] ?? 'unknown';
                
                // Calculate stake in SOL
                $stakeSol = $activatedStake / 1000000000; // Convert lamports to SOL
                $stakePercentage = 0.02; // Placeholder percentage
                
                // Calculate slot differences
                $lastVoteDiff = 0; // Placeholder
                $rootSlotDiff = 0; // Placeholder
                $skipRate = 0.00; // Placeholder
                
                $line = sprintf(
                    "%3d  %-44s  %-44s   %2d%%  %9d (%3d)  %9d (%3d)  %6.2f%%  %7s   %-14s %15.9f SOL (%0.2f%%)",
                    $i + 1,
                    $identity,
                    $vote,
                    $commission,
                    $lastVote,
                    $lastVoteDiff,
                    $rootSlot,
                    $rootSlotDiff,
                    $skipRate,
                    number_format($credits),
                    $version,
                    $stakeSol,
                    $stakePercentage
                );
                
                // Display first 50 validators to console
                if ($i < 50) {
                    $this->line($line);
                }
                
                $lines[] = $line;
            }
            
            // Save to file
            $output = implode("\n", $lines);
            $filename = 'validators-' . now()->format('Y-m-d_H-i-s') . '.txt';
            Storage::put("private/solana/{$filename}", $output);
            Storage::put('private/solana/latest.txt', $output);
            
            $this->line("");
            $this->info("Total validators: " . count($validators));
            $this->info("Current validators: " . count($currentValidators));
            $this->info("Delinquent validators: " . count($delinquentValidators));
            $this->info("Saved: storage/app/private/solana/{$filename}");
            $this->info("Saved: storage/app/private/solana/latest.txt");
            
            $this->info('Data fetched and displayed successfully');
            
            return 0;

        } catch (\Exception $e) {
            $this->error('RPC Error: ' . $e->getMessage());
            \Log::error('Solana RPC failed', ['error' => $e->getMessage()]);
            return 1;
        }
    }
    
    private function fetchClusterNodes()
    {
        $data = [
            'jsonrpc' => '2.0',
            'id' => 2,
            'method' => 'getClusterNodes'
        ];

        $ch = curl_init($this->rpcUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

        $response = curl_exec($ch);
        if (curl_errno($ch)) {
            $this->error('cURL Error (getClusterNodes): ' . curl_error($ch));
            curl_close($ch);
            return null;
        }
        curl_close($ch);

        $jsonData = json_decode($response, true);
        return $jsonData['result'] ?? null;
    }
    
    private function fetchVoteAccounts()
    {
        $data = [
            'jsonrpc' => '2.0',
            'id' => 1,
            'method' => 'getVoteAccounts'
        ];

        $ch = curl_init($this->rpcUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

        $response = curl_exec($ch);
        if (curl_errno($ch)) {
            $this->error('cURL Error (getVoteAccounts): ' . curl_error($ch));
            curl_close($ch);
            return null;
        }
        curl_close($ch);

        $jsonData = json_decode($response, true);
        return $jsonData['result'] ?? null;
    }
}