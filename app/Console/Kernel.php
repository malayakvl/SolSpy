<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use Illuminate\Support\Facades\Log;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule)
    {
        // Log scheduler start
        Log::channel('cron')->info('Scheduler started', [
            'time' => now()->toDateTimeString(),
            'timezone' => config('app.timezone'),
            'laravel_version' => app()->version(),
            'php_version' => phpversion(),
            'kernel_path' => __DIR__,
        ]);

        // Minimal closure-based task
        $schedule->call(function () {
            Log::channel('cron')->info('Test closure task ran at ' . now()->toDateTimeString());
        })->everyMinute()
          ->name('test-closure')
          ->appendOutputTo(storage_path('logs/closure-test.log'));

        // Original command
        $schedule->command('app:log-cron-job-execution "cron-test" --success --output="Cron job executed successfully"')
                 ->everyMinute()
                 ->appendOutputTo(storage_path('logs/cron-test.log'))
                 ->onSuccess(function () {
                     Log::channel('cron')->info('Cron test command succeeded at ' . now()->toDateTimeString());
                 })
                 ->onFailure(function () {
                     Log::channel('cron')->error('Cron test command failed at ' . now()->toDateTimeString());
                 });

        // Log scheduled tasks
        Log::channel('cron')->info('Scheduled tasks found: ' . count($schedule->events()));
        foreach ($schedule->events() as $index => $event) {
            Log::channel('cron')->info('Task ' . ($index + 1) . ': ' . ($event->command ?? $event->getSummaryForDisplay()));
        }
    }

    protected function commands()
    {
        // Use explicit full path
        $this->load('/var/www/solspy/app/Console/Commands');
        require base_path('routes/console.php');
    }
}