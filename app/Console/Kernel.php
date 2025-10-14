<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use Illuminate\Support\Facades\Log;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule)
    {
        // Log scheduler start with detailed info
        Log::channel('cron')->info('Scheduler started', [
            'time' => now()->toDateTimeString(),
            'timezone' => config('app.timezone'),
            'laravel_version' => app()->version(),
            'php_version' => phpversion(),
        ]);

        // Test command: app:log-cron-job-execution
        $schedule->command('app:log-cron-job-execution "cron-test" --success --output="Cron job executed successfully"')
                 ->everyMinute()
                 ->appendOutputTo(storage_path('logs/cron-test.log'))
                 ->onSuccess(function () {
                     Log::channel('cron')->info('Cron test command succeeded at ' . now()->toDateTimeString());
                 })
                 ->onFailure(function () {
                     Log::channel('cron')->error('Cron test command failed at ' . now()->toDateTimeString());
                 });

        // Test command: inspire
        $schedule->command('inspire')
                 ->everyMinute()
                 ->appendOutputTo(storage_path('logs/inspire.log'))
                 ->onSuccess(function () {
                     Log::channel('cron')->info('Inspire command succeeded at ' . now()->toDateTimeString());
                 })
                 ->onFailure(function () {
                     Log::channel('cron')->error('Inspire command failed at ' . now()->toDateTimeString());
                 });

        // Simple closure-based task
        $schedule->call(function () {
            Log::channel('cron')->info('Closure-based task ran at ' . now()->toDateTimeString());
        })->everyMinute()
          ->name('test-closure')
          ->appendOutputTo(storage_path('logs/closure-test.log'));

        // Log all scheduled tasks
        Log::channel('cron')->info('Scheduled tasks found: ' . count($schedule->events()));
        foreach ($schedule->events() as $index => $event) {
            Log::channel('cron')->info('Task ' . ($index + 1) . ': ' . ($event->command ?? $event->getSummaryForDisplay()));
        }
    }

    protected function commands()
    {
        $this->load(__DIR__.'/Commands');
        require base_path('routes/console.php');
    }
}