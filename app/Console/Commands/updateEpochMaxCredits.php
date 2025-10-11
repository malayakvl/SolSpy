<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class updateEpochMaxCredits extends Command
{
    protected $signature = 'app:update-epoch-max-credits';
    protected $description = 'Fetch vote accounts and update epoch max credits table';

    public function handle()
    {
        $this->info('Starting update of epoch max credits...');

        $rpcUrl = 'http://103.167.235.81:8899'; // RPC сервер

        // Получаем валидаторов
        $validatorsData = $this->rpcRequest($rpcUrl, 'getVoteAccounts');

        if (!isset($validatorsData['result'])) {
            $this->error('Invalid response from RPC');
            return 1;
        }

        $epochMaxCredits = [];

        // Обрабатываем current валидаторов
        if (isset($validatorsData['result']['current']) && is_array($validatorsData['result']['current'])) {
            foreach ($validatorsData['result']['current'] as $validator) {
                if (isset($validator['epochCredits']) && is_array($validator['epochCredits']) && count($validator['epochCredits']) > 0) {
                    $lastEpochCredit = end($validator['epochCredits']);
                    if (count($lastEpochCredit) >= 3) {
                        $epoch = (int)$lastEpochCredit[0];
                        $earnedCredits = (int)$lastEpochCredit[1] - (int)$lastEpochCredit[2];

                        // Сохраняем максимум для эпохи
                        if (!isset($epochMaxCredits[$epoch]) || $earnedCredits > $epochMaxCredits[$epoch]) {
                            $epochMaxCredits[$epoch] = $earnedCredits;
                        }
                    }
                }
            }
        }

        // Обрабатываем delinquent валидаторов (если нужно)
        if (isset($validatorsData['result']['delinquent']) && is_array($validatorsData['result']['delinquent'])) {
            foreach ($validatorsData['result']['delinquent'] as $validator) {
                if (isset($validator['epochCredits']) && is_array($validator['epochCredits']) && count($validator['epochCredits']) > 0) {
                    $lastEpochCredit = end($validator['epochCredits']);
                    if (count($lastEpochCredit) >= 3) {
                        $epoch = (int)$lastEpochCredit[0];
                        $earnedCredits = (int)$lastEpochCredit[1] - (int)$lastEpochCredit[2];

                        if (!isset($epochMaxCredits[$epoch]) || $earnedCredits > $epochMaxCredits[$epoch]) {
                            $epochMaxCredits[$epoch] = $earnedCredits;
                        }
                    }
                }
            }
        }

        // Вставляем или обновляем данные в базе
        foreach ($epochMaxCredits as $epoch => $maxCredits) {
            DB::table('data.epoch_max_credits')->updateOrInsert(
                ['epoch' => $epoch],
                ['max_earned_credits' => $maxCredits]
            );
        }

        $this->info('Epoch max credits table updated successfully.');

        return 0;
    }

    private function rpcRequest(string $url, string $method)
    {
        $data = [
            'jsonrpc' => '2.0',
            'id' => 1,
            'method' => $method,
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

        $response = curl_exec($ch);
        if (curl_errno($ch)) {
            $this->error('cURL error: ' . curl_error($ch));
            curl_close($ch);
            return null;
        }
        curl_close($ch);

        return json_decode($response, true);
    }
}
