<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FetchLeaderSchedule extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fetch-leader-schedule {epoch? : The epoch number to fetch (default: current epoch)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch Leader Schedule for all validators and save to database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        Log::info('Task FetchLeaderSchedule executed at: ' . now());
        $this->info('Start fetching leader schedule!');

        // Отримання епохи з аргументу або поточної
        $epoch = $this->argument('epoch');
        $rpcUrl = 'http://103.167.235.81:8899'; // Заміни на твій RPC-вузол, якщо потрібно

        // 1. Отримання інформації про поточну епоху
        $epochInfoData = [
            'jsonrpc' => '2.0',
            'id' => 1,
            'method' => 'getEpochInfo'
        ];

        $ch = curl_init($rpcUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($epochInfoData));

        $epochInfoResponse = curl_exec($ch);
        if (curl_errno($ch)) {
            Log::error('cURL Error (getEpochInfo): ' . curl_error($ch));
            $this->error('cURL Error: ' . curl_error($ch));
            curl_close($ch);
            return;
        }

        $epochInfo = json_decode($epochInfoResponse, true);
        if (!isset($epochInfo['result'])) {
            Log::error('Invalid getEpochInfo response structure');
            $this->error('Invalid getEpochInfo response structure');
            curl_close($ch);
            return;
        }

        $currentEpoch = $epochInfo['result']['epoch'];
        $slotsInEpoch = $epochInfo['result']['slotsInEpoch'];
        $absoluteSlot = $epochInfo['result']['absoluteSlot'];
        $epoch = $epoch ?? $currentEpoch; // Якщо епоха не вказана, беремо поточну
        $firstSlot = $absoluteSlot - ($epochInfo['result']['slotIndex'] % $slotsInEpoch) - ($slotsInEpoch * ($currentEpoch - $epoch));

        $this->info("Processing epoch: $epoch, First slot: $firstSlot");

        // 2. Отримання getLeaderSchedule
        $data = [
            'jsonrpc' => '2.0',
            'id' => 1,
            'method' => 'getLeaderSchedule',
            'params' => [
                $firstSlot,
                ['commitment' => 'confirmed']
            ]
        ];

        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        $response = curl_exec($ch);

        // Проверка на ошибки
        if (curl_errno($ch)) {
            Log::error('cURL Error (getLeaderSchedule): ' . curl_error($ch));
            $this->error('cURL Error: ' . curl_error($ch));
            curl_close($ch);
            return;
        }

        curl_close($ch);

        // Парсинг ответа
        $jsonData = json_decode($response, true);
        if (isset($jsonData['result'])) {
            $validatorCount = count($jsonData['result']);
            $this->info("Processing $validatorCount validators in leader schedule");

            // Виклик SQL-функції
            try {
                $query = "SELECT * FROM data.process_leader_schedule(:epoch, :leader_schedule::jsonb)";
                $result = DB::select($query, [
                    'epoch' => $epoch,
                    'leader_schedule' => json_encode($jsonData['result'])
                ]);

                Log::info("Leader schedule for epoch $epoch saved. Returned rows: " . count($result));
                $this->info("Leader schedule for epoch $epoch saved successfully");

                // Виведення метрик (опціонально)
                foreach ($result as $row) {
                    $this->line(sprintf(
                        "Validator %s: Actual votes = %d, Expected votes = %d, Skip rate = %.2f%%",
                        $row->node_pubkey,
                        $row->actual_votes ?? 0,
                        $row->expected_votes ?? 0,
                        $row->skip_rate ? ($row->skip_rate * 100) : 0
                    ));
                }
            } catch (\Exception $e) {
                Log::error('Database Error: ' . $e->getMessage());
                $this->error('Database Error: ' . $e->getMessage());
                return;
            }
        } else {
            Log::error('Invalid getLeaderSchedule response structure');
            $this->error('Invalid getLeaderSchedule response structure');
        }

        $this->info('Leader schedule processing completed');
    }
}