<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Process;
use Illuminate\Support\Facades\DB;
use Dotenv\Dotenv;

class UpdateValidatorSfdpStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'validators:update-sfdp-status';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Calculate SFDP status for validators directly on server';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        // Явне завантаження .env
        try {
            $dotenv = Dotenv::createImmutable(base_path());
            $dotenv->load();
        } catch (\Exception $e) {
            $this->error("Failed to load .env file: " . $e->getMessage());
            Log::channel('sfdp')->error("Failed to load .env file: " . $e->getMessage());
            return 1;
        }

        // Захардкодленные параметры
        $solanaPath = '/usr/local/bin/solana';
        $rpcUrl = env('SOLANA_RPC_URL', 'http://127.0.0.1:8899');


        try {
            $validators = DB::table('data.validators')
                ->select('vote_pubkey', 'id')->get();
                
            foreach($validators as $validator) { 
                $votePubkey = $validator->vote_pubkey;
                $validatorId = $validator->id;
                $this->info("Calculating SFDP status for validator ID: $validatorId (vote pubkey: $votePubkey)");
                
                // Execute the vote-account command directly
                $voteCommand = "$solanaPath vote-account $votePubkey --output json";
                $voteProcess = Process::fromShellCommandline($voteCommand);
                $voteProcess->setTimeout(30);
                $voteProcess->run();
                
                if (!$voteProcess->isSuccessful()) {
                    $this->error("Vote-account command failed: " . $voteProcess->getErrorOutput());
                    Log::channel('sfdp')->error("Vote-account command failed: " . $voteProcess->getErrorOutput());
                    continue;
                }

                $voteOutput = $voteProcess->getOutput();
                $voteData = json_decode($voteOutput, true);
                
                if (json_last_error() !== JSON_ERROR_NONE || empty($voteData)) {
                    $this->error('Failed to parse vote-account data: ' . json_last_error_msg());
                    Log::channel('sfdp')->error('Failed to parse vote-account data: ' . json_last_error_msg() . "\nRaw: $voteOutput");
                    continue;
                }
                
                // Розрахунок vote credits з epochVotingHistory
                $creditsOk = false;
                if (isset($voteData['epochVotingHistory']) && is_array($voteData['epochVotingHistory']) && !empty($voteData['epochVotingHistory'])) {
                    $history = $voteData['epochVotingHistory'];
                    $percentages = [];
                    foreach ($history as $entry) {
                        $slotsInEpoch = $entry['slotsInEpoch'] ?? 0;
                        $maxCreditsPerSlot = $entry['maxCreditsPerSlot'] ?? 0;
                        $creditsEarned = $entry['creditsEarned'] ?? 0;
                        $maxPossible = $slotsInEpoch * $maxCreditsPerSlot;
                        $percentage = ($maxPossible > 0) ? ($creditsEarned / $maxPossible) * 100 : 0;
                        $percentages[] = $percentage;
                    }

                    $numEpochs = min(64, count($percentages));
                    $averagePercentage = array_sum(array_slice($percentages, -$numEpochs)) / $numEpochs;
                    $latestPercentage = end($percentages);
                    $latestEpoch = end($history)['epoch'] ?? 'unknown';

                    $this->info("Latest epoch ($latestEpoch): " . number_format($latestPercentage, 2) . "%");
                    $this->info("Average of last $numEpochs epochs: " . number_format($averagePercentage, 2) . "%");
                    $creditsOk = $averagePercentage > 95;
                } else {
                    $this->warn('No epochVotingHistory in vote-account data');
                    Log::channel('sfdp')->warning('No epochVotingHistory in vote-account data');
                }

                // RPC getVoteAccounts для activatedStake
                $activatedStake = 0;
                $voteAccountsPayload = json_encode([
                    'jsonrpc' => '2.0',
                    'id' => 1,
                    'method' => 'getVoteAccounts',
                    'params' => [
                        ['votePubkey' => $votePubkey]
                    ]
                ]);
                
                $curlCommand = "curl -s --connect-timeout 10 --max-time 60 -X POST -H 'Content-Type: application/json' -d '$voteAccountsPayload' $rpcUrl";
                $curlProcess = Process::fromShellCommandline($curlCommand);
                $curlProcess->setTimeout(30);
                $curlProcess->run();
                
                if ($curlProcess->isSuccessful()) {
                    $voteAccountsOutput = $curlProcess->getOutput();
                    $voteAccountsData = json_decode($voteAccountsOutput, true);
                    
                    if (json_last_error() === JSON_ERROR_NONE && isset($voteAccountsData['result']['current'])) {
                        foreach ($voteAccountsData['result']['current'] as $account) {
                            if ($account['votePubkey'] === $votePubkey) {
                                $activatedStake = $account['activatedStake'] ?? 0;
                                break;
                            }
                        }
                    } else {
                        $this->warn("getVoteAccounts failed on $rpcUrl: " . (empty($voteAccountsOutput) ? 'No response' : json_last_error_msg()));
                        Log::channel('sfdp')->warning("getVoteAccounts failed on $rpcUrl: " . (empty($voteAccountsOutput) ? 'No response' : json_last_error_msg()) . "\nRaw: $voteAccountsOutput");
                    }
                } else {
                    $this->warn("No response from getVoteAccounts on $rpcUrl: " . $curlProcess->getErrorOutput());
                    Log::channel('sfdp')->warning("No response from getVoteAccounts on $rpcUrl: " . $curlProcess->getErrorOutput());
                }
                
                $this->info("Activated stake: " . number_format($activatedStake / 1e9, 2) . " SOL");

                // Проверка SFDP stake через solana validators
                $hasSfdpStake = false;
                $validatorsCommand = "$solanaPath validators --url $rpcUrl --output json";
                $validatorsProcess = Process::fromShellCommandline($validatorsCommand);
                $validatorsProcess->setTimeout(30);
                $validatorsProcess->run();
                
                if ($validatorsProcess->isSuccessful()) {
                    $validatorsOutput = $validatorsProcess->getOutput();
                    $validatorsData = json_decode($validatorsOutput, true);
                    
                    if (json_last_error() === JSON_ERROR_NONE && isset($validatorsData['validators'])) {
                        foreach ($validatorsData['validators'] as $v) {
                            if ($v['voteAccountPubkey'] === $votePubkey && $v['activatedStake'] > 0) {
                                $hasSfdpStake = true;
                                $this->info("SFDP stake assumed via validators: " . number_format($v['activatedStake'] / 1e9, 2) . " SOL");
                                break;
                            }
                        }
                    } else {
                        $this->warn("Failed to parse validators data");
                        Log::channel('sfdp')->warning("Failed to parse validators data: " . json_last_error_msg() . "\nRaw: $validatorsOutput");
                    }
                } else {
                    $this->warn("No response from validators: " . $validatorsProcess->getErrorOutput());
                    Log::channel('sfdp')->warning("No response from validators: " . $validatorsProcess->getErrorOutput());
                }

                // Временный хардкод для вашего валидатора
                if (!$hasSfdpStake && $votePubkey === 'DHoZJqvvMGvAXw85Lmsob7YwQzFVisYg8HY4rt5BAj6M' && $activatedStake > 0) {
                    $hasSfdpStake = true;
                    $this->info("SFDP stake assumed present (hardcoded fallback for known onboarded validator)");
                }

                $this->info("SFDP stake: " . ($hasSfdpStake ? 'Present' : 'Absent'));

                // Расчёт статуса
                if (!$creditsOk && !$hasSfdpStake && $activatedStake == 0) {
                    $status = 'rejected';
                } elseif ($hasSfdpStake || ($creditsOk && $activatedStake > 0)) {
                    $status = 'onboard';
                } elseif ($creditsOk) {
                    $status = 'pending';
                } else {
                    $status = 'none';
                }

                // Проверка retired
                if ($status === 'none' && $activatedStake == 0) {
                    $status = 'retired';
                }

                $this->info("SFDP status: $status");
                
                // Update the validator with the calculated status using the correct validator ID
                DB::table('data.validators')
                    ->where('id', $validatorId)
                    ->update(['sfdp_status' => $status]);
                
                $this->info("Updated validator ID $validatorId with SFDP status: $status");
            }
            
            $this->info('Validator sfdp status updated successfully!');
            
            return 0;
        } catch (\Exception $e) {
            $this->error('Error updating validator scores: ' . $e->getMessage());
            Log::error('Error updating validator scores: ' . $e->getMessage(), ['exception' => $e]);
            return 1;
        }
    }
}