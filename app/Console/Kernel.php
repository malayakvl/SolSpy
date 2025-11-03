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
        // $schedule->command('app:validators:update-tvc-jito')->daily();
        // Test command to verify cron is working
        // $schedule->command('app:log-cron-job-execution "cron-test" --success --output="Cron job executed successfully"')->everyMinute();
        // $schedule->command('app:log-cron-job-execution "cron-test" --success --output="Cron job executed successfully"')->everyMinute();
    }

    protected function commands()
    {
        $this->load(__DIR__.'/Commands');
        
        // Load commands from subdirectories
        $this->load(__DIR__.'/Commands/Rpc');
        $this->load(__DIR__.'/Commands/Validators');
        $this->load(__DIR__.'/Commands/Cron');
        
        require base_path('routes/console.php');
    }
}