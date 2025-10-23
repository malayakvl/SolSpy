<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use GuzzleHttp\Client;
use GuzzleHttp\Promise;
use GuzzleHttp\Exception\RequestException;
use Psr\Http\Message\ResponseInterface;

class FetchMetrics extends Command
{
    protected $signature = 'app:fetch-metrics';
    protected $description = 'Fetch Validators and Calculate TVC Metrics';

    public function handle()
    {
        ini_set('memory_limit', '512M');
        Log::info('Task app:fetch-metrics started at: ' . now());
        $this->info('Start fetching validators!');

        $rpcNode = ['url' => 'http://103.167.235.81:8899', 'name' => 'Local RPC'];

        $client = new Client([
            'base_uri' => $rpcNode['url'],
            'timeout' => 60,
            'connect_timeout' => 10,
            'stream' => true,
        ]);

        $this->info("Checking health of {$rpcNode['name']} RPC ({$rpcNode['url']})");
        if (!$this->checkNodeHealth($client)) {
            $this->error("RPC node {$rpcNode['name']} ({$rpcNode['url']}) is not healthy");
            Log::error("RPC node is not healthy", ['node' => $rpcNode]);
            return 1;
        }
        $this->info("Using RPC: {$rpcNode['name']} ({$rpcNode['url']})");

        $currentSlot = $this->getCurrentSlot($client);
        if (!$currentSlot) {
            $this->error("Failed to fetch current slot");
            Log::error("Failed to fetch current slot");
            return 1;
        }
        $this->info("Current slot: $currentSlot");

        $slotsPerEpoch = $this->getSlotsPerEpoch($client);
        if (!$slotsPerEpoch) {
            $slotsPerEpoch = 432000;
            $this->warn("Failed to fetch slots per epoch, using default: $slotsPerEpoch");
        }

        $cacheKeyVoteAccounts = 'vote_accounts';
        $jsonData = Cache::get($cacheKeyVoteAccounts);
        if (!$jsonData) {
            try {
                $response = $client->post('', [
                    'headers' => ['Content-Type' => 'application/json'],
                    'json' => [
                        'jsonrpc' => '2.0',
                        'id' => 1,
                        'method' => 'getVoteAccounts'
                    ]
                ]);
                $body = $response->getBody();
                $jsonData = '';
                while (!$body->eof()) {
                    $jsonData .= $body->read(1024);
                }
                $jsonData = json_decode($jsonData, true);
                Cache::put($cacheKeyVoteAccounts, $jsonData, now()->addMinutes(10));
            } catch (\Exception $e) {
                $this->error("getVoteAccounts error: " . $e->getMessage());
                Log::error('getVoteAccounts error', ['error' => $e->getMessage()]);
                return 1;
            }
        }

        if (!isset($jsonData['result'])) {
            $this->error("Invalid response structure - no 'result' key found");
            Log::error('getVoteAccounts: No result key in response', ['response' => $jsonData]);
            return 1;
        }

        $validators = $jsonData['result']['current'];
        $delinquentValidators = $jsonData['result']['delinquent'] ?? [];
        $this->info("Processing validators. Current count: " . count($validators));
        $this->info("Delinquent count: " . count($delinquentValidators));

        $targetVotePubkey = '53RJBy7aBGA7Aag6AryxEmBbsHDgwfBWagLrPbGHnfvR';
        $tvcMetrics = [];

        $targetValidator = null;
        foreach ($validators as $validator) {
            if ($validator['votePubkey'] === $targetVotePubkey) {
                $targetValidator = $validator;
                break;
            }
        }

        if (!$targetValidator) {
            foreach ($delinquentValidators as $validator) {
                if ($validator['votePubkey'] === $targetVotePubkey) {
                    $this->error("Validator $targetVotePubkey is delinquent");
                    Log::error("Validator is delinquent", ['votePubkey' => $targetVotePubkey]);
                    return 1;
                }
            }
            $this->error("Validator $targetVotePubkey not found in active or delinquent validators");
            Log::error("Validator not found", ['votePubkey' => $targetVotePubkey]);
            return 1;
        }
        $this->info("Found validator with vote pubkey: $targetVotePubkey");

        $jpoolMetrics = [
            'tvc_rank' => 32,
            'timely_vote_rate' => 99.99,
            'tvc_earned' => 1008389, 
            'avg_tvc_rank' => 192,
            'uptime' => 100,
        ];

        $cacheKeySignatures = 'vote_signatures_' . $targetVotePubkey;
        $usedSnapshot = false;

        Cache::forget($cacheKeySignatures);
        $this->info("Cleared signatures cache for $targetVotePubkey");

        $signatures = $this->getVoteSignatures($client, $targetVotePubkey, $currentSlot);
        if (!$signatures || isset($signatures['error']) || empty($signatures)) {
            $this->warn("Failed to fetch signatures from {$rpcNode['name']} RPC, falling back to JPool metrics");
            $usedSnapshot = true;
            $signatures = [];
            Log::warning("No signatures fetched", ['votePubkey' => $targetVotePubkey]);
        } else {
            $originalCount = count($signatures);
            $slots = array_map(function ($sig) { return $sig['slot'] ?? null; }, $signatures);
            Log::info("Signature slots fetched", ['min_slot' => min($slots), 'max_slot' => max($slots), 'currentSlot' => $currentSlot]);
            $signatures = array_filter($signatures, function ($sig) use ($currentSlot) {
                $isValidSlot = isset($sig['slot']) && is_numeric($sig['slot']) && ($currentSlot - $sig['slot']) <= 2000;
                $isRecent = isset($sig['blockTime']) && is_numeric($sig['blockTime']) && (time() - $sig['blockTime']) <= 86400;
                $noError = !isset($sig['err']);
                Log::info("Filtering signature {$sig['signature']}", [
                    'isValidSlot' => $isValidSlot,
                    'isRecent' => $isRecent,
                    'noError' => $noError,
                    'slot' => $sig['slot'] ?? null,
                    'blockTime' => $sig['blockTime'] ?? null,
                    'err' => $sig['err'] ?? null,
                ]);
                return $isValidSlot && $isRecent && $noError;
            });
            $this->info("Filtered signatures: " . count($signatures) . " out of $originalCount");
            Cache::put($cacheKeySignatures, $signatures, now()->addMinutes(10));
            $this->info("Fetched " . count($signatures) . " signatures from {$rpcNode['name']} RPC");
            Log::info("Fetched signatures", ['signatures' => array_slice($signatures, 0, 5)]);
        }

        $totalVotes = count($signatures);
        $timelyCount = 0;
        $totalLatency = 0;
        $missedVotes = 0;

        if ($totalVotes > 0) {
            $this->info("Memory usage before processing signatures: " . (memory_get_usage() / 1024 / 1024) . " MB");
            $batchSize = 20;
            $batches = array_chunk($signatures, $batchSize);
            $processedSignatures = [];

            foreach ($batches as $batchIndex => $batch) {
                $this->info("Processing batch " . ($batchIndex + 1) . " with " . count($batch) . " signatures");
                $promises = [];

                foreach ($batch as $sig) {
                    $promises[] = $client->postAsync('', [
                        'json' => [
                            'jsonrpc' => '2.0',
                            'id' => 1,
                            'method' => 'getTransaction',
                            'params' => [$sig['signature'], ['encoding' => 'jsonParsed', 'maxSupportedTransactionVersion' => 0, 'commitment' => 'finalized']]
                        ]
                    ]);
                }

                $responses = Promise\Utils::settle($promises)->wait();

                foreach ($responses as $index => $response) {
                    $signature = $batch[$index]['signature'];
                    if (isset($processedSignatures[$signature])) {
                        continue;
                    }

                    if ($response['state'] === 'fulfilled') {
                        try {
                            $body = $response['value']->getBody();
                            $jsonTx = '';
                            while (!$body->eof()) {
                                $jsonTx .= $body->read(1024);
                            }
                            $jsonTx = json_decode($jsonTx, true);
                            Log::info("getTransaction response for signature $signature", [
                                'hasResult' => isset($jsonTx['result']),
                                'metaErr' => $jsonTx['result']['meta']['err'] ?? null,
                                'instructions' => $jsonTx['result']['transaction']['message']['instructions'] ?? [],
                                'slot' => $jsonTx['result']['slot'] ?? null,
                                'blockTime' => $jsonTx['result']['blockTime'] ?? null,
                            ]);

                            $blockTime = $jsonTx['result']['blockTime'] ?? null;
                            $currentTime = time();
                            $isRecent = $blockTime && is_numeric($blockTime) && ($currentTime - $blockTime) <= 86400;

                            $isVoteTx = false;
                            $voteSlot = null;

                            if (isset($jsonTx['result']['meta']) && $jsonTx['result']['meta']['err'] === null && $isRecent) {
                                if (isset($jsonTx['result']['transaction']['message']['instructions'])) {
                                    foreach ($jsonTx['result']['transaction']['message']['instructions'] as $instruction) {
                                        if (isset($instruction['parsed']['type']) && in_array($instruction['parsed']['type'], ['vote', 'towersync'])) {
                                            $isVoteTx = true;
                                            $voteSlot = $jsonTx['result']['slot'] ?? null;
                                            break;
                                        }
                                    }
                                }
                            }

                            if ($isVoteTx && isset($voteSlot) && is_numeric($voteSlot)) {
                                $latency = $currentSlot - $voteSlot;
                                if ($latency >= 0 && $latency <= 2000) {
                                    $totalLatency += $latency;
                                    if ($latency <= 100) {
                                        $timelyCount++;
                                    }
                                    Log::info("Processed signature $signature", [
                                        'voteSlot' => $voteSlot,
                                        'currentSlot' => $currentSlot,
                                        'latency' => $latency,
                                        'isTimely' => $latency <= 100,
                                        'isVoteTx' => $isVoteTx,
                                        'blockTime' => $blockTime,
                                    ]);
                                    $processedSignatures[$signature] = true;
                                } else {
                                    Log::warning("Invalid latency for signature $signature", [
                                        'voteSlot' => $voteSlot,
                                        'currentSlot' => $currentSlot,
                                        'latency' => $latency,
                                        'isVoteTx' => $isVoteTx,
                                        'blockTime' => $blockTime,
                                    ]);
                                }
                            } else {
                                Log::warning("Invalid transaction data or not a vote transaction for signature $signature", [
                                    'isVoteTx' => $isVoteTx,
                                    'slotExists' => isset($jsonTx['result']['slot']),
                                    'isRecent' => $isRecent,
                                    'blockTime' => $blockTime,
                                    'metaErr' => $jsonTx['result']['meta']['err'] ?? null,
                                    'instructions' => $jsonTx['result']['transaction']['message']['instructions'] ?? [],
                                ]);
                            }
                        } catch (\Exception $e) {
                            Log::warning("Error processing transaction for signature $signature", [
                                'error' => $e->getMessage(),
                            ]);
                        }
                    } else {
                        Log::warning("Failed to fetch transaction for signature $signature", [
                            'error' => $response['reason'] ?? 'Unknown error',
                        ]);
                    }
                }

                unset($promises, $responses);
                gc_collect_cycles();
            }
            $this->info("Memory usage after processing signatures: " . (memory_get_usage() / 1024 / 1024) . " MB");
            $missedVotes = $totalVotes - $timelyCount;
            Log::info("Signature processing summary", [
                'totalVotes' => $totalVotes,
                'timelyCount' => $timelyCount,
                'totalLatency' => $totalLatency,
                'missedVotes' => $missedVotes,
            ]);
        }

        $avgTimelyRate = $totalVotes > 0 ? ($timelyCount / $totalVotes) * 100 : 0;
        if ($totalVotes > 0 && ($avgTimelyRate < 10 || $totalLatency < 0 || $timelyCount === 0)) {
            $this->warn("Invalid metrics (Timely Vote Rate: $avgTimelyRate%, Latency: $totalLatency), falling back to JPool metrics");
            $usedSnapshot = true;
            $avgTimelyRate = $jpoolMetrics['timely_vote_rate'];
            $tvcEarned = $jpoolMetrics['tvc_earned'];
            $missedVotes = 0;
            $totalVotes = 1;
            $voteLatency = $currentSlot - $targetValidator['lastVote'];
            $totalLatency = ($voteLatency <= 100 && $voteLatency >= 0) ? $voteLatency : 1.0;
            $timelyCount = $totalLatency <= 100 ? 1 : 0;
            Cache::forget($cacheKeySignatures);
            $this->info("Cleared invalid signatures cache for $targetVotePubkey");
        } else {
            $tvcEarned = round($avgTimelyRate / 100 * $slotsPerEpoch);
        }

        if ($totalVotes === 0) {
            $usedSnapshot = true;
            $this->warn("No vote signatures found for $targetVotePubkey, using snapshot with JPool metrics (TVC Rank: {$jpoolMetrics['tvc_rank']}, Timely Vote Rate: {$jpoolMetrics['timely_vote_rate']}%)");
            $avgTimelyRate = $jpoolMetrics['timely_vote_rate'];
            $tvcEarned = $jpoolMetrics['tvc_earned'];
            $voteLatency = $currentSlot - $targetValidator['lastVote'];
            $totalLatency = ($voteLatency <= 100 && $voteLatency >= 0) ? $voteLatency : 1.0;
            $timelyCount = $totalLatency <= 100 ? 1 : 0;
            $totalVotes = 1;
            $missedVotes = $totalLatency > 100 ? 1 : 0;
        }

        $avgLatency = $totalVotes > 0 ? $totalLatency / $totalVotes : $totalLatency;
        $uptime = $totalVotes > 0 ? max(0, 100 - (($missedVotes / $totalVotes) * 100)) : $jpoolMetrics['uptime'];

        // if ($avgTimelyRate < 99.9) {
        //     $this->sendTelegramAlert($targetVotePubkey, $avgTimelyRate);
        // }

        foreach ($validators as $validator) {
            $pubkey = $validator['votePubkey'];
            $lastVote = $validator['lastVote'];
            $activatedStake = $validator['activatedStake'];

            $voteLatency = $currentSlot - $lastVote;
            $voteLatency = ($voteLatency <= 100 && $voteLatency >= 0) ? $voteLatency : 1.0;
            $timelyVoteRate = $usedSnapshot ? ($jpoolMetrics['timely_vote_rate'] / 100) : ($voteLatency <= 100 ? 1.0 : max(0, 1 - ($voteLatency / 100)));

            $tvcMetrics[$pubkey] = [
                'timelyVoteRate' => $pubkey === $targetVotePubkey ? $avgTimelyRate / 100 : $timelyVoteRate,
                'missedVotes' => $pubkey === $targetVotePubkey ? $missedVotes : ($voteLatency > 100 ? 1 : 0),
                'activatedStake' => $activatedStake,
                'lastVote' => $lastVote,
                'rankWeight' => $usedSnapshot ? (rand(0, 1000) / 1000) : 0,
            ];
        }

        uasort($tvcMetrics, function ($a, $b) {
            if ($a['timelyVoteRate'] === $b['timelyVoteRate']) {
                if ($a['activatedStake'] === $b['activatedStake']) {
                    return $b['rankWeight'] <=> $a['rankWeight'];
                }
                return $b['activatedStake'] <=> $a['activatedStake'];
            }
            return $b['timelyVoteRate'] <=> $a['timelyVoteRate'];
        });

        $rank = 1;
        $targetMetrics = null;
        foreach ($tvcMetrics as $pubkey => $metrics) {
            if ($pubkey === $targetVotePubkey) {
                $targetMetrics = $metrics;
                if ($usedSnapshot) {
                    $rank = $jpoolMetrics['tvc_rank'];
                }
                break;
            }
            $rank++;
        }

        if ($targetMetrics) {
            $this->info("Validator TVC Metrics for vote pubkey: $targetVotePubkey");
            $this->info("Identity Pubkey: " . $targetValidator['nodePubkey']);
            $this->info("TVC Rank (approx): $rank (JPool: {$jpoolMetrics['tvc_rank']})");
            $this->info("Timely Vote Rate: " . number_format($targetMetrics['timelyVoteRate'] * 100, 2) . "% (JPool: {$jpoolMetrics['timely_vote_rate']}%)");
            $this->info("Avg Latency (slots): " . number_format($avgLatency, 2));
            $this->info("Missed Votes: " . $targetMetrics['missedVotes']);
            $this->info("Uptime: " . number_format($uptime, 2) . "% (JPool: {$jpoolMetrics['uptime']}%)");
            $this->info("Activated Stake: " . $targetMetrics['activatedStake']);
            $this->info("TVCs Earned (approx): " . number_format($tvcEarned) . " (JPool: {$jpoolMetrics['tvc_earned']})");
            $this->info("Avg TVC Rank (JPool): " . $jpoolMetrics['avg_tvc_rank']);
            if ($usedSnapshot) {
                $this->warn("Metrics based on snapshot or JPool fallback due to RPC limitations.");
            }
        } else {
            $this->error("Validator $targetVotePubkey not found in tvcMetrics");
            Log::error("Validator not found in tvcMetrics", ['votePubkey' => $targetVotePubkey]);
            return 1;
        }

        $this->info('All validators processed');
        return 0;
    }

    private function sendTelegramAlert($votePubkey, $timelyVoteRate)
    {
        try {
            $client = new Client();
            $botToken = env('TELEGRAM_BOT_TOKEN', 'your-bot-token');
            $chatId = env('TELEGRAM_CHAT_ID', 'your-chat-id');
            $message = "⚠️ Validator $votePubkey: Timely Vote Rate dropped to " . number_format($timelyVoteRate, 2) . "%!";
            $client->post("https://api.telegram.org/bot$botToken/sendMessage", [
                'json' => [
                    'chat_id' => $chatId,
                    'text' => $message,
                ],
            ]);
            $this->info("Telegram alert sent: $message");
        } catch (\Exception $e) {
            $this->error("Failed to send Telegram alert: " . $e->getMessage());
            Log::error('Telegram alert error', ['error' => $e->getMessage()]);
        }
    }

    private function checkNodeHealth($client)
    {
        try {
            $response = $client->post('', [
                'json' => [
                    'jsonrpc' => '2.0',
                    'id' => 1,
                    'method' => 'getHealth'
                ]
            ]);
            $body = $response->getBody();
            $jsonData = '';
            while (!$body->eof()) {
                $jsonData .= $body->read(1024);
            }
            $jsonData = json_decode($jsonData, true);
            if (isset($jsonData['result']) && $jsonData['result'] === 'ok') {
                return true;
            }
            $this->error("RPC node health check failed: " . ($jsonData['error']['message'] ?? 'Unknown error'));
            Log::error("RPC node health check failed", ['response' => $jsonData]);
            return false;
        } catch (\Exception $e) {
            $this->error('getHealth error: ' . $e->getMessage());
            Log::error('getHealth error', ['error' => $e->getMessage()]);
            return false;
        }
    }

    private function getCurrentSlot($client)
    {
        try {
            $response = $client->post('', [
                'json' => [
                    'jsonrpc' => '2.0',
                    'id' => 1,
                    'method' => 'getSlot'
                ]
            ]);
            $body = $response->getBody();
            $jsonData = '';
            while (!$body->eof()) {
                $jsonData .= $body->read(1024);
            }
            $jsonData = json_decode($jsonData, true);
            return $jsonData['result'] ?? null;
        } catch (\Exception $e) {
            $this->error('getCurrentSlot error: ' . $e->getMessage());
            Log::error('getCurrentSlot error', ['error' => $e->getMessage()]);
            return null;
        }
    }

    private function getSlotsPerEpoch($client)
    {
        try {
            $response = $client->post('', [
                'json' => [
                    'jsonrpc' => '2.0',
                    'id' => 1,
                    'method' => 'getEpochInfo'
                ]
            ]);
            $body = $response->getBody();
            $jsonData = '';
            while (!$body->eof()) {
                $jsonData .= $body->read(1024);
            }
            $jsonData = json_decode($jsonData, true);
            return $jsonData['result']['slotsInEpoch'] ?? null;
        } catch (\Exception $e) {
            $this->error('getEpochInfo error: ' . $e->getMessage());
            Log::error('getEpochInfo error', ['error' => $e->getMessage()]);
            return null;
        }
    }

    private function getVoteSignatures($client, $votePubkey, $currentSlot)
    {
        try {
            // First fetch the latest signature to use as 'before'
            $response = $client->post('', [
                'json' => [
                    'jsonrpc' => '2.0',
                    'id' => 1,
                    'method' => 'getSignaturesForAddress',
                    'params' => [$votePubkey, ['limit' => 1, 'commitment' => 'finalized']]
                ]
            ]);
            $body = $response->getBody();
            $jsonData = '';
            while (!$body->eof()) {
                $jsonData .= $body->read(1024);
            }
            $jsonData = json_decode($jsonData, true);
            if (isset($jsonData['error'])) {
                $this->error("getSignaturesForAddress (initial) error: " . $jsonData['error']['message']);
                Log::error('getSignaturesForAddress (initial) error', ['error' => $jsonData['error'], 'votePubkey' => $votePubkey]);
                return [];
            }

            $beforeSignature = $jsonData['result'][0]['signature'] ?? null;
            Log::info("Latest signature for $votePubkey", ['signature' => $beforeSignature]);

            // Fetch up to 100 signatures before the latest one
            $response = $client->post('', [
                'json' => [
                    'jsonrpc' => '2.0',
                    'id' => 1,
                    'method' => 'getSignaturesForAddress',
                    'params' => [$votePubkey, ['limit' => 100, 'commitment' => 'finalized', 'minContextSlot' => $currentSlot - 2000, 'before' => $beforeSignature]]
                ]
            ]);
            $body = $response->getBody();
            $jsonData = '';
            while (!$body->eof()) {
                $jsonData .= $body->read(1024);
            }
            $jsonData = json_decode($jsonData, true);
            if (isset($jsonData['error'])) {
                $this->error("getSignaturesForAddress error: " . $jsonData['error']['message']);
                Log::error('getSignaturesForAddress error', ['error' => $jsonData['error'], 'votePubkey' => $votePubkey]);
                return [];
            }
            $signatures = $jsonData['result'] ?? [];
            Log::info("Raw signatures fetched", ['count' => count($signatures), 'signatures' => array_slice($signatures, 0, 5), 'votePubkey' => $votePubkey]);
            return $signatures;
        } catch (RequestException $e) {
            $errorDetails = $e->hasResponse() ? $e->getResponse()->getBody()->getContents() : $e->getMessage();
            $this->error('getVoteSignatures error: ' . $errorDetails);
            Log::error('getVoteSignatures error', ['error' => $errorDetails, 'votePubkey' => $votePubkey]);
            return [];
        }
    }
}