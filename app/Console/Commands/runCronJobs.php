<?php

namespace App\Console\Commands;
use Illuminate\Support\Facades\Artisan;

use Illuminate\Console\Command;

class runCronJobs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:run-cron-jobs';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run cron jobs';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        //
        while (true) {
            // Здесь ваша логика для команды app:fetch-validators
            $this->info('Cron every 1 sec...');
//            Artisan::call('score:update-metrics');
//            Artisan::call('score:update-validators');
            Artisan::call('app:fetch-validators');


            // Например, вызов метода или сервиса стара версия
            // Вызов команды app:fetch-validators
//            // Artisan::call('app:update-epoch-max-credits'); //Need to start hourly
            Artisan::call('app:fetch-validators');
//            Artisan::call('rpc:fetch-validators');
//            // Artisan::call('rpc:fetch-validator-scores');
//            // Artisan::call('validators:update-scores-auto');
//            // Artisan::call('validators:update-spy-rank');
            

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
