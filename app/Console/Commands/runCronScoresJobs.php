<?php

namespace App\Console\Commands;
use Illuminate\Support\Facades\Artisan;

use Illuminate\Console\Command;

class runCronScoresJobs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:run-cron-scores-jobs';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run cron scores jobs';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        //
        while (true) {
            // Здесь ваша логика для команды app:fetch-validators
            $this->info('Cron every 1 sec...');
            // Например, вызов метода или сервиса
            // Вызов команды app:fetch-validators
            Artisan::call('rpc:fetch-validator-scores');
            

            // Вывод результата команды (опционально)
            $output = Artisan::output();
            if ($output) {
                $this->info($output);
            }

            // Задержка 1 секунд
            sleep(1);
        }
    }
}
