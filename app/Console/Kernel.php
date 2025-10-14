<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule)
    {
        // Log that the scheduler is running
        \Log::channel('cron')->info('Scheduler started at ' . now());

        // Test command
        $schedule->command('app:log-cron-job-execution "cron-test" --success --output="Cron job executed successfully"')
                 ->everyMinute()
                 ->appendOutputTo(storage_path('logs/cron-test.log'))
                 ->onSuccess(function () {
                     \Log::channel('cron')->info('Cron test command succeeded at ' . now());
                 })
                 ->onFailure(function () {
                     \Log::channel('cron')->error('Cron test command failed at ' . now());
                 });

        // Add a second test with the built-in 'inspire' command
        $schedule->command('inspire')
                 ->everyMinute()
                 ->appendOutputTo(storage_path('logs/inspire.log'))
                 ->onSuccess(function () {
                     \Log::channel('cron')->info('Inspire command succeeded at ' . now());
                 })
                 ->onFailure(function () {
                     \Log::channel('cron')->error('Inspire command failed at ' . now());
                 });

        // Log all scheduled tasks for debugging
        foreach ($schedule->events() as $event) {
            \Log::channel('cron')->info('Scheduled task: ' . $event->command);
        }
    }

    protected function commands()
    {
        $this->load(__DIR__.'/Commands');
        require base_path('routes/console.php');
    }
}