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
                $this->info("Fetched " . count($data['validators']) . " validators at offset $offset");
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

        $this->info("Total validators fetched: " . count($allValidators));

        // Пример обработки всех валидаторов
        foreach ($allValidators as $validator) {
            // Здесь ваша логика обработки каждого валидатора
            $result = $validator;
            try {
                $updResult = [
                    "result" => ["current" => $validator],
                ];
                $response = json_encode($updResult);
                $responseStripped = preg_replace("/(?<!\\\\)'/", '`', $response);
                $query = "SELECT data.update_validators_marinade('$responseStripped'::jsonb);";
                DB::statement($query);
                $this->info("Updated: " . $validator['info_name'] . ", identity: " .$result['identity']);
            } catch (\Exception $e) {
                \Log::error("Failed to update validators: " . $e->getMessage());
                throw $e; // Or handle as needed
            }
        }
        $this->info('All validators was updated');

    }
}
