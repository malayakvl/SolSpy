<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class LogCronJobExecution extends Command
{
    protected $signature = 'app:log-cron-job-execution {message} {--success} {--output=}';
    protected $description = 'Log a cron execution message for testing the scheduler';

    public function handle()
    {
        $message = $this->argument('message');
        $success = $this->option('success');
        $output = $this->option('output');

        $logMessage = $output ?? ($success ? "$message - SUCCESS" : "$message - FAILED");
        Log::channel('cron')->info($logMessage);
        $this->info($logMessage);

        return 0;
    }
}