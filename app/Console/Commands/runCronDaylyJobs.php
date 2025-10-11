<?php

namespace App\Console\Commands;
use Illuminate\Support\Facades\Artisan;

use Illuminate\Console\Command;

class runCronDaylyJobs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:run-cron-dayly-jobs';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run dayly cron jobs';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Run daily cron jobs once
        $this->info('Running daily cron jobs...');
        
        // Call the validators fetch command
        Artisan::call('app:fech-validators');
        
        // Update validator scores
        Artisan::call('validators:update-scores-auto');
        
        // Output results (optional)
        $output = Artisan::output();
        if ($output) {
            $this->info($output);
        }
        
        $this->info('Daily cron jobs completed.');
    }
}