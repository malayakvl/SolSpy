<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class fechValidatorsMarinade extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fech-validators-marinade';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch validators marinade';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        //
        \Log::info('Task executed at: ' . now());
        $this->info('Start fetching validators static info!');
        $limit = 500; // Количество записей за один запрос
        $offset = 0; // Начальное смещение
        $allValidators = [];

        do {
            try {
                // Выполняем GET-запрос с текущими limit и offset
                $response = Http::get('https://validators-api.marinade.finance/validators', [
                    'limit' => $limit,
                    'offset' => $offset,
                ]);

                // Проверяем, успешен ли запрос
                if ($response->failed()) {
                    echo "API request failed with status " . $response->status() . "\n";
                    break; // Прерываем цикл при ошибке
                }

                // Получаем JSON-ответ
                $data = $response->json();

                // Проверяем, есть ли ключ 'validators' и является ли он массивом
                if (!isset($data['validators']) || !is_array($data['validators'])) {
                    echo "No validators found or invalid response format\n";
                    break;
                }

                // Добавляем валидаторы из текущей порции в общий массив
                $allValidators = array_merge($allValidators, $data['validators']);

                // Выводим информацию о текущей порции (для отладки)
                echo "Fetched " . count($data['validators']) . " validators at offset $offset\n";
//                break;
                // Если получено меньше записей, чем limit, это последняя страница
                if (count($data['validators']) < $limit) {
                    break;
                }

                // Увеличиваем offset для следующей порции
                $offset += $limit;

            } catch (\Exception $e) {
                // Обработка исключений (например, проблемы с сетью)
                echo "Error occurred: " . $e->getMessage() . "\n";
                break;
            }
        } while (true);

        echo "Total validators fetched: " . count($allValidators) . "\n";

        // Пример обработки всех валидаторов
        foreach ($allValidators as $validator) {
            // Здесь ваша логика обработки каждого валидатора
            $result = $validator;
            echo "Update Validator: " . $validator['info_name'] . ", identity: " .$result['identity']. "\n"; // Пример, предполагая, что есть поле 'address'

            try {
                $sql = 'UPDATE data.validators SET
                    name = :name,
                    start_epoch = :start_epoch,
                    url = :url,
                    ip = :ip,
                    latitude = :latitude,
                    longitude = :longitude,
                    country = :country,
                    city = :city,
                    version = :version,
                    superminority = :superminority,
                    epoch_stats = :epoch_stats,
                    epochs_count = :epochs_count,
                    has_last_epoch_stats = :has_last_epoch_stats,
                    avg_uptime = :avg_uptime,
                    avg_apy = :avg_apy
                WHERE vote_pubkey = :vote_pubkey AND node_pubkey = :node_pubkey';

                $superminority = $result['superminority'] === 1 ? true : false;
                $stats = json_encode($result['epoch_stats']);
                $hLastEpochStat = $result['has_last_epoch_stats'] == 1 ? true : false;


                $bindings = [
                    'name' => !empty($result['info_name']) && is_string($result['info_name']) ? trim($result['info_name'], "'\"") : null,
                    'start_epoch' => !empty($result['start_epoch']) && is_numeric($result['start_epoch']) ? (int)$result['start_epoch'] : null,
                    'url' => $result['info_url'],
                    'ip' => $result['node_ip'],
                    'latitude' => !empty($result['dc_coordinates_lat']) && is_numeric($result['dc_coordinates_lat']) ? (float)$result['dc_coordinates_lat'] : null,
                    'longitude' => !empty($result['dc_coordinates_lon']) && is_numeric($result['dc_coordinates_lon']) ? (float)$result['dc_coordinates_lon'] : null,
                    'country' => $result['dc_country'],
                    'city' => $result['dc_city'],
                    'version' => $result['version'],
                    'superminority' => $superminority === 1 ? true : false,
                    'epoch_stats' => $stats, // Assuming JSON or string
                    'epochs_count' => !empty($result['epochs_count']) && is_numeric($result['epochs_count']) ? (int)$result['epochs_count'] : null,
                    'has_last_epoch_stats' => $hLastEpochStat === 1 ? true : false,
                    'avg_uptime' => !empty($result['avg_uptime_pct']) && is_numeric($result['avg_uptime_pct']) ? (float)$result['avg_uptime_pct'] : null,
                    'avg_apy' => !empty($result['avg_apy']) && is_numeric($result['avg_apy']) ? (float)$result['avg_apy'] : null,
                    'vote_pubkey' => $result['vote_account'],
                    'node_pubkey' => $result['identity']
                ];

                DB::statement($sql, $bindings);
            } catch (\Exception $e) {
                \Log::error("Failed to update validators: " . $e->getMessage());
                throw $e; // Or handle as needed
            }

//            $query = ('UPDATE data.validators SET
//                        name = '.$name. ',
//                        start_epoch = '.$startEpoch. ',
//                        url = '.$url. ',
//                        ip = '.$ip. ',
//                        latitude = '.($lat ? $lat : 0). ',
//                        longitude = '.($lng ? $lng : 0). ',
//                        country = '.$country. ',
//                        city = '.$city. ',
//                        version = '.$version. ',
//                        superminority = '.($superminority === 1 ? 'true' : 'false'). ',
//                        epoch_stats = '.$stats. ',
//                        epochs_count = '.$epochCount. ',
//                        has_last_epoch_stats = '.($hLastEpochStat === 1 ? 'true' : 'false'). ',
//                        avg_uptime = '.$avgUptine. ',
//                        avg_apy = '.$avgApy. '
//                      WHERE vote_pubkey = \'' .$result['vote_account'].'\' AND node_pubkey = \'' .$result['identity'].'\'
//                ');
//            DB::statement($query);
        }
        echo "All fetched";

//        try {
//            $response = Http::get('https://validators-api.marinade.finance/validators?limit=1&offset=0');
//            if ($response->failed()) {
//                echo "API request failed" . $response->status() . "\n";
////                break;
//            }
//
//            $data = $response->json();
//            foreach ($data['validators'] as $result) {
////                dd($result);exit;
////                $asn = DB::getPdo()->quote($result['ip_asn']);
//                $city = DB::getPdo()->quote($result['dc_city']);
//                $country = DB::getPdo()->quote($result['dc_country']);
//                $stats = DB::getPdo()->quote(json_encode($result['epoch_stats']));
//                $version = DB::getPdo()->quote($result['version']);
//                $query = ('UPDATE validators SET
//                        v_city = '.$city. ',
//                        v_country = '.$country. ',
//                        v_version = '.$version. ',
//                        v_credits = '.$result['credits']. ',
//                        v_activated_stake = '.$result['activated_stake']. ',
//                        superminority = '.($result['superminority'] ? 1 : 0). ',
//                        start_epoch = '.$result['start_epoch']. ',
//                        epochs_count = '.$result['epochs_count']. ',
//                        epoch_stats = '.$stats. '
//                      WHERE vote_pubkey = \'' .$result['vote_account'].'\' OR node_pubkey = \'' .$result['vote_account'].'\'
//                ');
////                echo $query."\n";
//
//                DB::statement($query);
//            }
//            echo "API request failed for update validators done\n";
//
//
//            echo "All records processed successfully!\n";
//
//        } catch (Exception $e) {
//            echo "Error: " . $e->getMessage() . "\n";
//        }
    }
}
