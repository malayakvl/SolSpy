<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule)
    {
        // $schedule->command('app:run-cron-daily-jobs')->daily();
        // $schedule->command('app:fetch-signatures')->everyTenMinutes();
        // Test command to verify cron is working
        // $schedule->command('app:log-cron-job-execution "cron-test" --success --output="Cron job executed successfully"')->everyMinute();
        $schedule->command('app:log-cron-job-execution "cron-test" --success --output="Cron job executed successfully"')->everyMinute();
    }

    protected function commands()
    {
        $this->load(__DIR__);
        
        require base_path('routes/console.php');
    }
}