<?php

namespace App\Console\Commands\Validators;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use GuzzleHttp\Client;
use GuzzleHttp\Pool;
use GuzzleHttp\Psr7\Request;

class FetchAllValidatorsLeaderSchedule extends Command
{
    protected $signature = 'app:fetch-all-validators-leader-scedule {epoch}';
    // protected $signature = 'app:update-all-votes {epoch? : The epoch number to fetch (default: current epoch)}';
    protected $description = 'Update fact votes for all validators in a given epoch';

    public function handle()
    {
        $epoch = $this->argument('epoch');
        $rpcUrl = '1111'; // Заміни на твій RPC-вузол, якщо потрібно
        $client = new Client(['timeout' => 10]);

        // Отримання всіх валідаторів
        $validators = DB::table('data.validators')->get(['node_pubkey', 'vote_pubkey']);

        $this->info("Знайдено " . $validators->count() . " валідаторів для обробки");

        foreach ($validators as $validator) {
            $nodePubkey = $validator->node_pubkey;
            $votePubkey = $validator->vote_pubkey;

            // Отримання слотів для валідатора в епосі
            $slotRecord = DB::table('data.leader_schedule')
                           ->where('validator_pubkey', $nodePubkey)
                           ->where('epoch', $epoch)
                           ->first();

            if (!$slotRecord) {
                $this->warn("Слоти для валідатора $nodePubkey в епосі $epoch не знайдено");
                continue;
            }

            $slots = json_decode($slotRecord->slots, true);
            $this->info("Аналізуємо " . count($slots) . " слотів для валідатора $nodePubkey");

            // Створення запитів для getBlock
            $requests = function () use ($slots, $rpcUrl) {
                foreach ($slots as $slot) {
                    yield new Request('POST', $rpcUrl, [
                        'Content-Type' => 'application/json',
                    ], json_encode([
                        'jsonrpc' => '2.0',
                        'id' => $slot,
                        'method' => 'getBlock',
                        'params' => [$slot, ['encoding' => 'jsonParsed']],
                    ]));
                }
            };

            $actualVotes = 0;

            // Пул для паралельних запитів
            $pool = new Pool($client, $requests(), [
                'concurrency' => 10, // Обмежуємо до 10 паралельних запитів
                'fulfilled' => function ($response, $index) use (&$actualVotes, $votePubkey, $slots) {
                    $body = json_decode($response->getBody(), true);
                    $slot = $slots[$index];

                    if (isset($body['result']['transactions'])) {
                        foreach ($body['result']['transactions'] as $tx) {
                            if (isset($tx['transaction']['message']['instructions'])) {
                                foreach ($tx['transaction']['message']['instructions'] as $instruction) {
                                    if (
                                        $instruction['programId'] === 'Vote111111111111111111111111111111111111111' &&
                                        isset($instruction['parsed']['info']['votePubkey']) &&
                                        $instruction['parsed']['info']['votePubkey'] === $votePubkey
                                    ) {
                                        $actualVotes++;
                                        $this->info("Знайдено голос у слоті $slot для $votePubkey");
                                        break;
                                    }
                                }
                            }
                        }
                    }
                },
                'rejected' => function ($reason, $index) use ($slots) {
                    $this->warn("Помилка при аналізі слота {$slots[$index]}: $reason");
                },
            ]);

            // Виконання пулу
            $promise = $pool->promise();
            $promise->wait();

            // Оновлення бази
            DB::table('data.leader_schedule')
              ->where('validator_pubkey', $nodePubkey)
              ->where('epoch', $epoch)
              ->update(['actual_votes' => $actualVotes]);

            $expectedVotes = count($slots);
            $voteRate = $expectedVotes > 0 ? ($actualVotes / $expectedVotes) * 100 : 0;

            $this->info("Валідатор $nodePubkey: Очікувані голоси: $expectedVotes, Фактичні голоси: $actualVotes, Vote Rate: " . number_format($voteRate, 2) . "%");
        }

        $this->info("Оновлення завершено");
    }
}