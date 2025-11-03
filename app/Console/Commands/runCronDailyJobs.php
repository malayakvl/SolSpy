<?php

namespace App\Console\Commands;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Console\Command;
use App\Models\CronJobLog;

class RunCronDailyJobs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:run-cron-daily-jobs';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run daily cron jobs - should be scheduled to run once per day';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Create log entry
        $log = new CronJobLog();
        $log->command_name = 'app:run-cron-daily-jobs';
        $log->started_at = now();
        $log->save();
        
        try {
            // Run daily cron jobs once
            $this->info('Running daily cron jobs...');
            
            // Call the validators fetch command
            Artisan::call('app:fetch-settings');
            
            // Update validator scores
            // Artisan::call('validators:update-scores-auto');
            Artisan::call('rpc:fetch-skip-rate');
            
            // Output results (optional)
            $output = Artisan::output();
            if ($output) {
                $this->info($output);
            }
            
            $this->info('Daily cron jobs completed.');
            
            // Update log entry
            $log->completed_at = now();
            $log->success = true;
            $log->output = 'Daily cron jobs completed successfully';
            $log->save();
            
        } catch (\Exception $e) {
            // Log the error
            $log->completed_at = now();
            $log->success = false;
            $log->error_message = $e->getMessage();
            $log->save();
            
            $this->error('Daily cron jobs failed: ' . $e->getMessage());
            return 1;
        }
    }
}