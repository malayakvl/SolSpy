<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule)
    {
        // Log scheduler start with time zone and Laravel version
        \Log::channel('cron')->info('Scheduler started at ' . now()->toDateTimeString() . ' (Timezone: ' . config('app.timezone') . ', Laravel: ' . app()->version() . ')');

        // Test command
        $schedule->command('app:log-cron-job-execution "cron-test" --success --output="Cron job executed successfully"')
                 ->everyMinute()
                 ->appendOutputTo(storage_path('logs/cron-test.log'))
                 ->onSuccess(function () {
                     \Log::channel('cron')->info('Cron test command succeeded at ' . now()->toDateTimeString());
                 })
                 ->onFailure(function () {
                     \Log::channel('cron')->error('Cron test command failed at ' . now()->toDateTimeString());
                 });

        // Add inspire command for additional testing
        $schedule->command('inspire')
                 ->everyMinute()
                 ->appendOutputTo(storage_path('logs/inspire.log'))
                 ->onSuccess(function () {
                     \Log::channel('cron')->info('Inspire command succeeded at ' . now()->toDateTimeString());
                 })
                 ->onFailure(function () {
                     \Log::channel('cron')->error('Inspire command failed at ' . now()->toDateTimeString());
                 });

        // Log all scheduled tasks
        \Log::channel('cron')->info('Scheduled tasks found: ' . count($schedule->events()));
        foreach ($schedule->events() as $index => $event) {
            \Log::channel('cron')->info('Task ' . ($index + 1) . ': ' . $event->command);
        }
    }

    protected function commands()
    {
        $this->load(__DIR__.'/Commands');
        require base_path('routes/console.php');
    }
}