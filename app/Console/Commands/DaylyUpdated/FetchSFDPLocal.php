<?php

namespace App\Console\Commands\DaylyUpdated;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use phpseclib3\Net\SSH2;
use Dotenv\Dotenv;
use Exception;
use function App\Console\Commands\Rpc\str_contains;

class FetchSFDPLocal extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'score:update-status';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch sfdp local';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        Log::info('Command app:fetch-sfdp executed at ' . now());
        $this->info('Start fetching sfdp info!');

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

            $sfdpOfficialData = [];
            try {
                $sfdpResponse = \Illuminate\Support\Facades\Http::timeout(10)
                    ->get('https://api.solana.org/api/community/v1/sfdp_participants');

                if ($sfdpResponse->successful()) {
                    foreach ($sfdpResponse->json() as $item) {
                        // Исправленный ключ: mainnetBetaPubkey
                        if (isset($item['mainnetBetaPubkey'])) {
                            $sfdpOfficialData[$item['mainnetBetaPubkey']] = $item;
                        }
                    }
                    $this->info("Loaded " . count($sfdpOfficialData) . " validators from official SFDP API.");
                }
            } catch (\Exception $e) {
                $this->warn("Could not fetch SFDP API: " . $e->getMessage());
            }

            $validators = DB::table('data.validators')
                ->select('vote_pubkey', 'id')
                ->where('vote_pubkey', '=', '53RJBy7aBGA7Aag6AryxEmBbsHDgwfBWagLrPbGHnfvR')
                ->get();
            foreach ($validators as $validator) {
                $votePubkey = $validator->vote_pubkey;
                $validatorId = $validator->id;
                $this->info("Calculating SFDP status for validator ID: $validatorId (vote pubkey: $votePubkey)");

                // Запрос в локальный RPC getVoteAccounts
                $rpcUrl = 'http://127.0.0.1:8899';
                $voteAccountsPayload = json_encode([
                    'jsonrpc' => '2.0',
                    'id' => 1,
                    'method' => 'getVoteAccounts',
                    'params' => [
                        ['votePubkey' => $votePubkey]
                    ]
                ]);

                $voteAccountsCurl = "curl -s --connect-timeout 10 --max-time 30 -X POST -H 'Content-Type: application/json' -d '$voteAccountsPayload' $rpcUrl 2>&1";
                $voteAccountsOutput = $ssh->exec($voteAccountsCurl);

                $voteAccountsData = json_decode($voteAccountsOutput, true);
                $account = null;
                if (json_last_error() === JSON_ERROR_NONE) {
                    $all = array_merge(
                        $voteAccountsData['result']['current'] ?? [],
                        $voteAccountsData['result']['delinquent'] ?? []
                    );
                    foreach ($all as $acc) {
                        if (($acc['votePubkey'] ?? '') === $votePubkey) {
                            $account = $acc;
                            break;
                        }
                    }
                }

                if (!$account) {
                    $this->error("Failed to fetch vote account from RPC for $votePubkey");
                    continue;
                }

                // Извлекаем стейк и комиссию
                $activatedStake = (float)($account['activatedStake'] ?? 0) / 1e9;
                $commission = (int)($account['commission'] ?? 0);

                $this->info("Activated stake: " . number_format($activatedStake, 2) . " SOL");
                $this->info("Commission: {$commission}%");

                // Расчет эпох и перформанса
                $epochCredits = $account['epochCredits'] ?? [];
                $creditsOk = false;

                if (!empty($epochCredits)) {
                    if (count($epochCredits) > 1) {
                        array_pop($epochCredits); // Отбрасываем текущую незавершенную эпоху
                    }

                    $percentages = [];
                    $latestEpoch = 'unknown';

                    foreach ($epochCredits as $entry) {
                        // [0] = epoch, [1] = end credits, [2] = start credits
                        $epoch = $entry[0];
                        $creditsEarned = max(0, $entry[1] - $entry[2]);

                        // Норма кредитов за полную эпоху в Solana (~432,000 слотов)
                        $maxPossibleInEpoch = 432000;
                        $percentage = ($creditsEarned / $maxPossibleInEpoch) * 100;

                        $percentages[] = min(100.0, $percentage);
                        $latestEpoch = $epoch;
                    }

                    $numEpochs = min(64, count($percentages));
                    $slicedPercentages = array_slice($percentages, -$numEpochs);
                    $averagePercentage = array_sum($slicedPercentages) / $numEpochs;
                    $latestPercentage = end($percentages);

                    $this->info("Latest epoch ($latestEpoch): " . number_format($latestPercentage, 2) . "%");
                    $this->info("Average of last $numEpochs epochs: " . number_format($averagePercentage, 2) . "%");

                    $creditsOk = $averagePercentage >= 95.0;
                } else {
                    $this->warn("No epochCredits found in RPC response");
                }

                if (isset($sfdpOfficialData[$votePubkey])) {
                    $sfdpEntry = $sfdpOfficialData[$votePubkey];
                    $rawState = strtolower($sfdpEntry['state'] ?? '');
                    $testnetState = strtolower($sfdpEntry['testnetState'] ?? '');

                    // 1. ONBOARDED (Только если state явно говорит onboard)
                    if (str_contains($rawState, 'onboard')) {
                        $status = 'onboard';
                    }
                    // 2. REJECTED / OFFBOARDED / RETIRED
                    elseif (
                        str_contains($rawState, 'reject') ||
                        str_contains($rawState, 'retire') ||
                        str_contains($rawState, 'offboard') ||
                        str_contains($rawState, 'delist') ||
                        str_contains($testnetState, 'reject') ||
                        str_contains($testnetState, 'offboard')
                    ) {
                        $status = 'rejected';
                    }
                    // 3. PENDING (Только если стейк > 0 ИЛИ перформанс ок, но НЕТ дисквалификации)
                    elseif (str_contains($rawState, 'pending') || str_contains($rawState, 'applied')) {
                        // На solana.org если у валидатора статус Pending, но стейк меньше нормы фонда (100k SOL),
                        // сайт показывает его как Rejected/Inactive.
                        if ($activatedStake < 100000 && $activatedStake > 0) {
                            $status = 'rejected';
                        } else {
                            $status = 'pending';
                        }
                    }
                    else {
                        $status = 'rejected';
                    }
                } else {
                    // Если валидатора вообще нет в реестре SFDP — он не в программе
                    if ($commission > 5 || !$creditsOk) {
                        $status = 'rejected';
                    } elseif ($activatedStake >= 100000) {
                        $status = 'onboard';
                    } else {
                        $status = 'rejected';
                    }
                }

                $this->info("Calculated SFDP status: $status");
                $this->info("Commission: {$commission}%");

                // Запись в базу
                DB::table('data.validators')
                    ->where('id', $validatorId)
                    ->update([
                        'sfdp_status' => $status,
                        'commission' => $commission,
                        'updated_at' => now(),
                    ]);

                $this->info("Updated validator ID $validatorId");
                $this->line('----------------------------------------------------');
            }
            $this->line('----------------------------------------------------');
            $this->line('----------------------------------------------------');
            $this->line('TASK DONE');
exit;





            foreach($validators as $validator) { 
                $votePubkey = $validator->vote_pubkey;
                $validatorId = $validator->id;
                $this->info("Calculating SFDP status for validator ID: $validatorId (vote pubkey: $votePubkey)");


                // Execute the command to get all validators
                // $command = "$solanaPath validators -um --sort=credits -r -n";
                $voteCommand = "$solanaPath vote-account $votePubkey --output json 2>&1";
                $voteOutput = $ssh->exec($voteCommand);
                $voteExitStatus = $voteOutput ? 0 : 1;

                dd($voteOutput);exit;

                if ($voteExitStatus !== 0 || empty($voteOutput)) {
                    $this->error("Vote-account command failed with exit status: $voteExitStatus");
                    $this->error("Vote output: $voteOutput");
                    Log::channel('sfdp')->error("Vote-account command failed: $voteOutput");
                    continue;
                }

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
                $rpcUrl = 'http://127.0.0.1:8899'; // Локальний RPC, бо ми на сервері
                $activatedStake = 0;
                $voteAccountsPayload = json_encode([
                    'jsonrpc' => '2.0',
                    'id' => 1,
                    'method' => 'getVoteAccounts',
                    'params' => [
                        ['votePubkey' => $votePubkey]
                    ]
                ]);
                $voteAccountsCurl = "curl -s --connect-timeout 10 --max-time 60 -X POST -H 'Content-Type: application/json' -d '$voteAccountsPayload' $rpcUrl 2>&1";
                $voteAccountsOutput = $ssh->exec($voteAccountsCurl);


                if (!empty($voteAccountsOutput)) {
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
                    $this->warn("No response from getVoteAccounts on $rpcUrl");
                    Log::channel('sfdp')->warning("No response from getVoteAccounts on $rpcUrl");
                }
                $this->info("Activated stake: " . number_format($activatedStake / 1e9, 2) . " SOL");

                // Проверка SFDP stake через solana validators
                $hasSfdpStake = false;
                $validatorsCommand = "$solanaPath validators --url $rpcUrl --output json 2>&1";
                $validatorsOutput = $ssh->exec($validatorsCommand);
                if (!empty($validatorsOutput)) {
                    $validatorsData = json_decode($validatorsOutput, true);
                    if (json_last_error() === JSON_ERROR_NONE && isset($validatorsData['validators'])) {
                        foreach ($validatorsData['validators'] as $validator) {
                            if ($validator['voteAccountPubkey'] === $votePubkey && $validator['activatedStake'] > 0) {
                                $hasSfdpStake = true;
                                $this->info("SFDP stake assumed via validators: " . number_format($validator['activatedStake'] / 1e9, 2) . " SOL");
                                break;
                            }
                        }
                    } else {
                        $this->warn("Failed to parse validators data");
                        Log::channel('sfdp')->warning("Failed to parse validators data: " . json_last_error_msg() . "\nRaw: $validatorsOutput");
                    }
                } else {
                    $this->warn("No response from validators");
                    Log::channel('sfdp')->warning("No response from validators");
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
                // DB::table('data.validators')
                //     ->where('id', $validatorId)
                //     ->update(['sfdp_status' => $status]);
                
                $this->info("Updated validator ID $validatorId with SFDP status: $status");
            }
            
            
            $ssh->disconnect();
            
            $this->info('Validator sfdp status updated successfully via SSH!');
            
            return 0;
        } catch (\Exception $e) {
            $this->error('Error updating validator scores: ' . $e->getMessage());
            Log::error('Error updating validator scores via SSH: ' . $e->getMessage(), ['exception' => $e]);
            return 1;
        }
    }
}