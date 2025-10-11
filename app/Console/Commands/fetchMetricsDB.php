<?php

namespace App\Console\Commands;

use App\Models\ValidatorMetric;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use GuzzleHttp\Client;
use GuzzleHttp\Promise;
use GuzzleHttp\Exception\RequestException;

class FetchMetricsDB extends Command
{
    protected $signature = 'app:fetch-metrics-db';
    protected $description = 'Fetch and save accurate metrics for validator 53RJBy7a... to data.validator_metrics';

    public function handle()
    {
        Log::info('Сбор точных метрик для валидатора 53RJBy7a... начат', ['time' => now()->toDateTimeString()]);

        $rpcNode = ['url' => 'http://103.167.235.81:8899', 'name' => 'Local RPC'];
        $client = new Client([
            'base_uri' => $rpcNode['url'],
            'timeout' => 60,
            'connect_timeout' => 10,
        ]);

        if (!$this->checkNodeHealth($client)) {
            Log::error('RPC-нода не здорова', ['node' => $rpcNode]);
            return 1;
        }

        $currentSlot = $this->getCurrentSlot($client);
        if (!$currentSlot) {
            Log::error('Ошибка получения текущего слота');
            return 1;
        }

        $slotsPerEpoch = $this->getSlotsPerEpoch($client);
        if (!$slotsPerEpoch) {
            $slotsPerEpoch = 432000;
            Log::warning('Не удалось получить слоты в эпохе, используем по умолчанию', ['slotsPerEpoch' => $slotsPerEpoch]);
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
                Log::error('Ошибка getVoteAccounts', ['error' => $e->getMessage()]);
                return 1;
            }
        }

        if (!isset($jsonData['result']['current'])) {
            Log::error('getVoteAccounts: Нет ключа current в ответе', ['response' => $jsonData]);
            return 1;
        }

        $targetVotePubkey = '53RJBy7aBGA7Aag6AryxEmBbsHDgwfBWagLrPbGHnfvR';
        $validator = collect($jsonData['result']['current'])->firstWhere('votePubkey', $targetVotePubkey);

        if (!$validator) {
            Log::error('Валидатор не найден в списке активных', ['votePubkey' => $targetVotePubkey]);
            return 1;
        }

        $votePubkey = $validator['votePubkey'];
        $nodePubkey = $validator['nodePubkey'];
        $lastVote = $validator['lastVote'];
        $activatedStake = $validator['activatedStake'];

        $signatures = $this->getVoteSignatures($client, $votePubkey, $currentSlot);
        $totalVotes = count($signatures);
        $timelyCount = 0;
        $totalLatency = 0;
        $missedVotes = 0;

        if ($totalVotes > 0) {
            $batchSize = 20;
            $batches = array_chunk($signatures, $batchSize);
            $processedSignatures = [];

            foreach ($batches as $batch) {
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
                                    if ($latency <= 2) {
                                        $timelyCount++;
                                    }
                                    Log::info('Обработана подпись', [
                                        'votePubkey' => $votePubkey,
                                        'signature' => $signature,
                                        'voteSlot' => $voteSlot,
                                        'latency' => $latency,
                                        'isTimely' => $latency <= 2,
                                    ]);
                                    $processedSignatures[$signature] = true;
                                }
                            }
                        } catch (\Exception $e) {
                            Log::warning('Ошибка обработки транзакции', ['votePubkey' => $votePubkey, 'signature' => $signature, 'error' => $e->getMessage()]);
                        }
                    } else {
                        Log::warning('Ошибка получения транзакции', ['votePubkey' => $votePubkey, 'signature' => $signature, 'error' => $response['reason'] ?? 'Неизвестная ошибка']);
                    }
                }
            }

            $missedVotes = $totalVotes - $timelyCount;
            $avgTimelyRate = $totalVotes > 0 ? ($timelyCount / $totalVotes) * 100 : 0;
            $avgLatency = $totalVotes > 0 ? $totalLatency / $totalVotes : 1.0;
            $uptime = $totalVotes > 0 ? max(0, 100 - ($missedVotes / $totalVotes * 100)) : 100;
            $tvcEarned = round($avgTimelyRate / 100 * 6912000);
        } else {
            Log::warning('Подписи не найдены, используем lastVote', ['votePubkey' => $votePubkey]);
            $avgLatency = $currentSlot - $lastVote;
            $avgLatency = ($avgLatency >= 0 && $avgLatency <= 2000) ? $avgLatency : 1.0;
            $avgTimelyRate = max(0, 100 - ($avgLatency / 100));
            $missedVotes = $avgLatency > 100 ? 1 : 0;
            $uptime = 100 - ($missedVotes * 100);
            $tvcEarned = round($avgTimelyRate / 100 * 6912000);
        }

        ValidatorMetric::updateOrCreate(
            ['vote_pubkey' => $votePubkey, 'current_slot' => $currentSlot],
            [
                'identity_pubkey' => $nodePubkey,
                'tvc_rank' => 0,
                'timely_vote_rate' => $avgTimelyRate,
                'avg_latency' => $avgLatency,
                'missed_votes' => $missedVotes,
                'uptime' => $uptime,
                'activated_stake' => $activatedStake,
                'tvc_earned' => $tvcEarned,
                'last_vote' => $lastVote,
            ]
        );

        Log::info('Метрики сохранены', ['votePubkey' => $votePubkey, 'timely_vote_rate' => $avgTimelyRate, 'tvc_earned' => $tvcEarned]);
        return 0;
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
            Log::error('Проверка здоровья RPC-ноды не удалась', ['response' => $jsonData]);
            return false;
        } catch (\Exception $e) {
            Log::error('Ошибка getHealth', ['error' => $e->getMessage()]);
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
            Log::error('Ошибка getCurrentSlot', ['error' => $e->getMessage()]);
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
            Log::error('Ошибка getEpochInfo', ['error' => $e->getMessage()]);
            return null;
        }
    }

    private function getVoteSignatures($client, $votePubkey, $currentSlot)
    {
        try {
            $response = $client->post('', [
                'headers' => ['Content-Type' => 'application/json'],
                'json' => [
                    'jsonrpc' => '2.0',
                    'id' => 1,
                    'method' => 'getSignaturesForAddress',
                    'params' => [$votePubkey, ['limit' => 100, 'commitment' => 'finalized']]
                ]
            ]);
            $body = $response->getBody();
            $jsonData = '';
            while (!$body->eof()) {
                $jsonData .= $body->read(1024);
            }
            $jsonData = json_decode($jsonData, true);
            return $jsonData['result'] ?? [];
        } catch (\Exception $e) {
            Log::error('Ошибка getSignaturesForAddress', ['votePubkey' => $votePubkey, 'error' => $e->getMessage()]);
            return [];
        }
    }
}