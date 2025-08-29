<?php

namespace App\Console\Commands\NOTUSED;

use App\Console\Commands\Exception;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class fechValidatorsNameCommand extends Command
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
            dd($data);
            foreach ($data as $result) {
                $escapedName = DB::getPdo()->quote($result['name']);
                $escapedDetails = DB::getPdo()->quote($result['details']);
                DB::table('validators')
                    ->where('vote_pubkey', $result['account'])
                    ->orWhere('node_pubkey', $result['account'])
                    ->update([
                        'name' => $result['name'],
                        'details' => $result['details'],
                        'latitude' => $result['latitude'] ? $result['latitude'] : NULL, // Используем null вместо пустой строки
                        'longitude' => $result['longitude'] ? $result['longitude'] : NULL, // Используем null вместо пустой строки
                        'avatar_file_url' => @$result['avatar_file_url'] ? $result['avatar_file_url'] : '',
                        'url' => @$result['url'] ? $result['url'] : '',
                    ]);
//                $query = ('UPDATE validators SET
//                        name = '.$escapedName. ',
//                        details = '.$escapedDetails. ',
//                        latitude = \''.($result['latitude'] ? $result['latitude'] : null). '\',
//                        longitude = \''.($result['longitude'] ? $result['longitude'] : null). '\',
//                        avatar_file_url = \''.(isset($result['avatar_file_url']) ? $result['avatar_file_url'] : ''). '\',
//                        url = \''.($result['url'] ? $result['url'] : ''). '\'
//                      WHERE vote_pubkey = \'' .$result['account'].'\' OR node_pubkey = \'' .$result['account'].'\'
//                ');
//                echo $query."\n";
//                DB::statement($query);
            }
            echo "API request failed for update validators done\n";

//            do {
//                // Выборка 5 записей из таблицы votes
//                $records = DB::select(
//                    'SELECT id, vote_pubkey, node_pubkey, name, created_at, updated_at
//                             FROM validators
//                             WHERE vote_pubkey = \'HxRrsnbc6K8CdEo3LCTrSUkFaDDxv9BdJsTDzBKnUVWH\'
//                             ORDER BY id
//                             LIMIT 1 OFFSET ?',
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
//                    ])->get("https://www.validators.app/api/v1/validators/mainnet.json?search=".$record->vote_pubkey);
//
//                    if ($response->failed()) {
//                        echo "API request failed for vote_pubkey={$record->vote_pubkey}: " . $response->status() . "\n";
//                        continue;
//                    }
//
//                    $data = $response->json();
//                    foreach ($data as $_data) {
//                        if ($_data["account"] === '7y5VhV4fkz6r4zUmH2UiwPjLwXzPL1PcV28or5NWkWRL') {
//                            dd($_data);exit;
//                        }
//                    }
////                    $collection = collect($data);
////                    $results = $collection->where('account', $record->node_pubkey);
////                    dd($data);exit;
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
