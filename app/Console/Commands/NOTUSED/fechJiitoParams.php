<?php

namespace App\Console\Commands\NOTUSED;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class fechJiitoParams extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fech-jiito-params';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch Validators';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        //
        // Ваша логика задачи здесь
        Log::info('Task executed at: ' . now());
        $this->info('Start fetching validators!');

        // Налаштування API
        $api_url = 'https://kobe.mainnet.jito.network/api/v1/validator_rewards';
        $api_key = 'YOUR_API_KEY'; // Замініть на ваш API ключ, якщо потрібен
        $vote_account = '3teZKwABvB99bxZc5q8yVWJt5mbhxgUAx4teMdUbzgN4'; // Приклад vote_account
        $epoch = 840; // Приклад епохи

        // Параметри запиту
        $params = [
            'vote_account' => $vote_account,
            'epoch' => $epoch,
            'limit' => 10, // Обмеження кількості результатів
            'sort_order' => 'desc' // Сортування за спаданням
        ];

        // Формування URL з параметрами
        $query = http_build_query($params);
        $full_url = $api_url . '?' . $query;

        // Ініціалізація cURL
        $ch = curl_init();

        // Налаштування cURL
        curl_setopt($ch, CURLOPT_URL, $full_url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'x-jito-auth: ' . $api_key // Додайте API ключ, якщо потрібен
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30); // Таймаут 30 секунд

        // Виконання запиту
        $response = curl_exec($ch);

        // Перевірка на помилки
        if (curl_errno($ch)) {
            echo 'Помилка cURL: ' . curl_error($ch);
            curl_close($ch);
            exit;
        }

        // Закриття cURL
        curl_close($ch);

        // Декодування JSON відповіді
        $data = json_decode($response, true);

        // Перевірка, чи вдалося декодувати JSON
        if (json_last_error() !== JSON_ERROR_NONE) {
            echo 'Помилка декодування JSON: ' . json_last_error_msg();
            exit;
        }

        // Обробка відповіді
        if (isset($data['rewards']) && !empty($data['rewards'])) {
            foreach ($data['rewards'] as $reward) {
                $vote_account = $reward['vote_account'];
                $mev_commission = $reward['mev_commission'] / 100; // Конвертація з bps в %
                $mev_revenue = $reward['mev_revenue'] / 1_000_000_000; // Конвертація лампортів у SOL
                $epoch = $reward['epoch'];

                echo "Валідатор: $vote_account\n";
                echo "Епоха: $epoch\n";
                echo "MEV Комісія: $mev_commission%\n";
                echo "MEV Дохід: $mev_revenue SOL\n";
                echo "------------------------\n";
            }
        } else {
            echo "Дані не знайдено або відповідь порожня.\n";
        }
    }
}