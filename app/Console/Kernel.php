<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule)
    {
        $schedule->command('app:run-cron-daily-jobs')->daily();
        $schedule->command('app:fetch-signatures')->everyTenMinutes();
        // $schedule->command('app:run-cron-dayly-jobs')->daily();
        // Test cron job - runs every minute for verification
        // $schedule->command('app:test-cron-job')->everyMinute();
    }

    protected function commands()
    {
        $this->load(__DIR__);
        require base_path('routes/console.php');
    }
}