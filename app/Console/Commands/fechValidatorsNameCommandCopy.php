<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class fechValidatorsNameCommandCopy extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fech-validators-name-command';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch validators name';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        //
        \Log::info('Task executed at: ' . now());
        $this->info('Start fetching validators name!');

        try {
            $perPage = 5; // Количество записей за раз
            $offset = 0;  // Начальный offset

            $response = Http::withHeaders([
                'Token' => 'cmZs2kcAsJAXkUwc5gs2CHkW',
            ])->get("https://www.validators.app/api/v1/validators/mainnet.json");
            if ($response->failed()) {
                echo "API request failed" . $response->status() . "\n";
//                break;
            }

            $data = $response->json();
            foreach ($data as $result) {
                $escapedName = DB::getPdo()->quote($result['name']);
                $escapedDetails = DB::getPdo()->quote($result['details']);
                $query = ('UPDATE validators SET
                        name = '.$escapedName. ',
                        details = '.$escapedDetails. '
                      WHERE vote_pubkey = \'' .$result['account'].'\' OR node_pubkey = \'' .$result['account'].'\'
                ');
                echo $query."\n";

//                $query = ('UPDATE validators SET
//                        name = \''.$result['name']. '\',
//
//                        keybase_id = \''.($result['keybase_id'] ? $result['keybase_id'] : ''). '\',
//                        www_url = \''.($result['www_url'] ? $result['www_url'] : ''). '\',
//                        details = \''.$result['details'] ? $result['details'] : ''). '\',
//                        active_stake = \''.($result['active_stake'] ? $result['active_stake'] : ''). '\',
//                        commission = \''.($result['commission'] ? $result['commission'] : ''). '\',
//                        data_center_concentration_score = \''.($result['data_center_concentration_score'] ? $result['data_center_concentration_score'] : ''). '\',
//                        published_information_score = \''.($result['published_information_score'] ? $result['published_information_score'] : ''). '\',
//                        root_distance_score = \''.($result['root_distance_score'] ? $result['root_distance_score'] : ''). '\',
//                        security_report_score = \''.($result['security_report_score'] ? $result['security_report_score'] : ''). '\',
//                        skipped_slot_score = \''.($result['skipped_slot_score'] ? $result['skipped_slot_score'] : ''). '\',
//                        skipped_after_score = \''.($result['skipped_after_score']). '\',
//                        software_version = \''.($result['software_version']). '\',
//                        software_version_score = \''.($result['software_version_score']). '\',
//                        stake_concentration_score = \''.($result['stake_concentration_score']). '\',
//                        consensus_mods_score = \''.($result['consensus_mods_score']). '\',
//                        vote_latency_score = \''.($result['vote_latency_score']). '\',
//                        total_score = \''.($result['total_score']). '\',
//                        vote_distance_score = \''.($result['vote_distance_score']). '\',
//                        software_client = \''.($result['software_client']). '\',
//                        software_client_id = \''.($result['software_client_id']). '\',
//                        ip = \''.($result['ip']). '\',
//                        data_center_key = \''.($result['data_center_key']). '\',
//                        autonomous_system_number = \''.($result['autonomous_system_number']). '\',
//                        latitude = \''.($result['latitude']. '\',
//                        longitude = \''.($result['longitude']). '\',
//                        data_center_host = \''.($result['data_center_host']). '\',
//                        epoch_credits = \''.($result['epoch_credits']). '\',
//                        epoch = \''.($result['epoch']). '\',
//                        skipped_slots = \''.($result['skipped_slots']). '\',
//                        skipped_slot_percent = \''.($result['skipped_slot_percent']). '\',
//                        url = \''.($result['url']). '\',
//                        network = \''.($result['network']). '\',
//                        avatar_file_url = \''.$result['avatar_file_url'] ? $result['avatar_file_url'] : ''. '\'
//                      WHERE vote_pubkey = \'' .$result['account'].'\' OR node_pubkey = \'' .$result['account'].'\'
//                ');
                DB::statement($query);

//                DB::statement(
//                    'INSERT INTO validators (
//                        name, vote_pubkey, keybase_id, www_url,
//                        details, avatar_file_url, active_stake, commission,
//                        data_center_concentration_score,  published_information_score,
//                        root_distance_score,
//                        security_report_score,
//                        skipped_slot_score,
//                        skipped_after_score,
//                        software_version,
//                        software_version_score,
//                        stake_concentration_score,
//                        consensus_mods_score,
//                        vote_latency_score,
//                        total_score,
//                        vote_distance_score,
//                        software_client,
//                        software_client_id,
//                        ip,
//                        data_center_key,
//                        autonomous_system_number,
//                        latitude,
//                        longitude,
//                        data_center_host,
//                        epoch_credits,
//                        epoch,
//                        skipped_slots,
//                        skipped_slot_percent,
//                        url,
//                        created_at,
//                        updated_at
//                    )
//                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
//                         ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
//                         ?, ?,
//                         NOW(), NOW()
//                 )
//                 ON CONFLICT (vote_pubkey)
//                 DO UPDATE SET
//                     vote_pubkey = EXCLUDED.vote_pubkey,
//                     updated_at = NOW()',
//                    ["'".$result['name']."'", "'".$result['account']."'",
//                        "'".$result['keybase_id']."'", "'".$result['www_url']."'", "'".$result['details']."'",
//                        "'".$result['avatar_file_url']."'", $result['active_stake'], $result['commission'],
//                        $result['data_center_concentration_score'],  $result['published_information_score'],
//                        $result['root_distance_score'], $result['security_report_score'], $result['skipped_slot_score'],
//                        $result['skipped_after_score'], "'".$result['software_version']."'", $result['software_version_score'],
//                        $result['stake_concentration_score'], $result['consensus_mods_score'], $result['vote_latency_score'],
//                        $result['total_score'], $result['vote_distance_score'], "'".$result['software_client']."'",
//                        $result['software_client_id'], "'".$result['ip']."'", "'".$result['data_center_key']."'",
//                        "'".$result['autonomous_system_number']."'", $result['latitude'], $result['longitude'],
//                        "'".$result['data_center_host']."'", $result['epoch_credits'], $result['epoch'],
//                        $result['skipped_slots'], $result['skipped_slot_percent'],
//                        "'".$result['url']."'"
//                    ]
//                );
            }
            echo "API request failed for update validators done\n";

//            do {
//                // Выборка 5 записей из таблицы votes
//                $records = DB::select(
//                    'SELECT id, vote_pubkey, node_pubkey, name, created_at, updated_at
//                             FROM validators
//                             WHERE name IS NULL
//                             ORDER BY id
//                             LIMIT 5 OFFSET ?',
//                                    [$offset]
//                );
//
//
////                dd($records);exit;
//
//                // Проверка, есть ли записи
//                if (empty($records)) {
//                    echo "No more records to process.\n";
//                    break;
//                }
//
//                // Обработка каждой записи
//                foreach ($records as $record) {
//                    echo "Processing record: ID={$record->id}, vote_pubkey={$record->vote_pubkey}, node_pubkey={$record->node_pubkey}\n";
//
//                    // Пример: Вызов API для получения дополнительных данных
//                    $response = Http::withHeaders([
//                        'Token' => 'cmZs2kcAsJAXkUwc5gs2CHkW',
//                    ])->get("https://www.validators.app/api/v1/validators/mainnet.json");
//
//                    if ($response->failed()) {
//                        echo "API request failed for vote_pubkey={$record->vote_pubkey}: " . $response->status() . "\n";
//                        continue;
//                    }
//
//                    $data = $response->json();
//                    dd($data);exit;
//
//                    // Пример обработки ответа API
////                    if (isset($result['result']['current'])) {
////                        foreach ($result['result']['current'] as $account) {
////                            $newNodePubkey = $account['nodePubkey'] ?? $record->node_pubkey;
////                            $newName = $account['name'] ?? $record->name;
////
////                            // Обновление записи в таблице votes
////                            DB::statement(
////                                'INSERT INTO votes (vote_pubkey, node_pubkey, name, created_at, updated_at)
////                         VALUES (?, ?, ?, NOW(), NOW())
////                         ON CONFLICT (vote_pubkey, node_pubkey)
////                         DO UPDATE SET
////                             node_pubkey = EXCLUDED.node_pubkey,
////                             name = EXCLUDED.name,
////                             updated_at = NOW()',
////                                [$record->vote_pubkey, $newNodePubkey, $newName]
////                            );
////
////                            echo "Updated record: vote_pubkey={$record->vote_pubkey}, node_pubkey={$newNodePubkey}\n";
////                        }
////                    }
//                }
//
//                // Увеличение offset для следующей порции
//                $offset += $perPage;
//
//            } while (!empty($records)); // Продолжать, пока есть записи

            echo "All records processed successfully!\n";

        } catch (Exception $e) {
            echo "Error: " . $e->getMessage() . "\n";
        }
    }
}
