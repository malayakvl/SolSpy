<?php

namespace App\Console\Commands;
use Illuminate\Support\Facades\Artisan;

use Illuminate\Console\Command;

class fechInterval extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fech-interval';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch Interval';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        //
        while (true) {
            // Здесь ваша логика для команды app:fetch-validators
            $this->info('Cron every 5 sec...');
            // Например, вызов метода или сервиса
            // Вызов команды app:fetch-validators
            Artisan::call('app:fech-validators');

            // Вывод результата команды (опционально)
            $output = Artisan::output();
            if ($output) {
                $this->info($output);
            }

            // Задержка 5 секунд
            sleep(5);
        }

    }
}