<?php

namespace App\Console\Commands\Rpc;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Exception;

class FetchValidatorsLocal extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'rpc:fetch-validators-local';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch validators local from RPC';
    
    protected $rpcUrl = 'http://103.167.235.81:8899';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Get collectLength from settings table
        $dbSettings = DB::table('data.settings')->first();
        $collectLength = $dbSettings->collect_score_retention ?? 10;
        
        Log::info('Command rpc:fetch-tvc-scores executed at ' . now());
        $this->info("Start fetching tvc scores info (keeping last $collectLength collections)!");

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
            
            // Prepare validator data for database insertion (similar to FetchValidatorsServer)
            $validatorScores = [];
            
            // Process all validators and prepare data for database insertion
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
                
                // Prepare data for database insertion (similar to FetchValidatorsServer lines 75-97)
                $validatorScores[] = [
                    'rank' => $i + 1,
                    'node_pubkey' => $identity,
                    'vote_pubkey' => $vote,
                    'uptime' => '100.00%', // Placeholder, similar to how it would be in CLI output
                    'root_slot' => (int)$rootSlot,
                    'vote_slot' => (int)$lastVote,
                    'commission' => (float)$commission,
                    'credits' => (int)$credits,
                    'version' => $version,
                    'stake' => $stakeSol, // Store as decimal, not string with "SOL"
                    'stake_percent' => $stakePercentage,
                    'collected_at' => now()->format('Y-m-d H:i:s'),
                    'created_at' => now()->format('Y-m-d H:i:s'),
                    'updated_at' => now()->format('Y-m-d H:i:s')
                ];
            }
            
            // Insert validator scores into database using PostgreSQL function
            if (!empty($validatorScores)) {
                $scoresJson = json_encode($validatorScores);
                $insertedCount = DB::select("SELECT data.insert_validator_scores(?::jsonb) as count", [$scoresJson])[0]->count;
                $this->info("Inserted $insertedCount validator scores into database using PostgreSQL function");
            }
            
            // Clean up old data (keep only the specified number of collections)
            $this->cleanupOldData($collectLength);
            
            $this->info("Total validators: " . count($validators));
            $this->info("Current validators: " . count($currentValidators));
            $this->info("Delinquent validators: " . count($delinquentValidators));
            
            $this->info('Data fetched and displayed successfully');
            
            return 0;

        } catch (\Exception $e) {
            $this->error('RPC Error: ' . $e->getMessage());
            \Log::error('Solana RPC failed', ['error' => $e->getMessage()]);
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