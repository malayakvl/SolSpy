<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class fechValidatorsStaticInfoMarinade extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fech-validators-static-marinade-info';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch validators static info';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        //
        \Log::info('Task executed at: ' . now());
        $this->info('Start fetching validators static info!');
        $limit = 10; // Количество записей за один запрос
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
            echo "Update Validator: " . $validator['vote_account'] . "\n"; // Пример, предполагая, что есть поле 'address'
            $city = DB::getPdo()->quote($result['dc_city']);
            $country = DB::getPdo()->quote($result['dc_country']);
            $stats = DB::getPdo()->quote(json_encode($result['epoch_stats']));
            $version = DB::getPdo()->quote($result['version']);
            $query = ('UPDATE validators SET
                        v_city = '.$city. ',
                        v_country = '.$country. ',
                        v_version = '.$version. ',
                        v_credits = '.$result['credits']. ',
                        v_activated_stake = '.$result['activated_stake']. ',
                        superminority = '.($result['superminority'] ? 1 : 0). ',
                        start_epoch = '.$result['start_epoch']. ',
                        epochs_count = '.$result['epochs_count']. ',
                        epoch_stats = '.$stats. '
                      WHERE vote_pubkey = \'' .$result['vote_account'].'\' OR node_pubkey = \'' .$result['vote_account'].'\'
                ');
//                echo $query."\n";

            DB::statement($query);
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
