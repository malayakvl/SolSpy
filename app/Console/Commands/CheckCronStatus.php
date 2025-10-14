<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\CronJobLog;
use Illuminate\Support\Facades\DB;

class CheckCronStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cron:check-status {--command= : Check status for a specific command}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check cron job execution status and report any issues';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking cron job status...');
        
        // Check if we can connect to the database
        try {
            DB::connection()->getPdo();
            $this->info('✓ Database connection successful');
        } catch (\Exception $e) {
            $this->error('✗ Database connection failed: ' . $e->getMessage());
            return 1;
        }
        
        $commandName = $this->option('command');
        
        if ($commandName) {
            $this->checkSpecificCommand($commandName);
        } else {
            $this->checkAllCommands();
        }
        
        return 0;
    }
    
    /**
     * Check status for all commands
     */
    private function checkAllCommands()
    {
        $this->info('Checking all cron commands...');
        
        // Get list of commands from Kernel
        $kernel = app(\App\Console\Kernel::class);
        
        // For now, we'll check our known commands
        $commands = [
            'app:run-cron-daily-jobs',
            'app:fetch-signatures'
        ];
        
        foreach ($commands as $command) {
            $this->checkCommandStatus($command);
        }
    }
    
    /**
     * Check status for a specific command
     */
    private function checkSpecificCommand($commandName)
    {
        $this->info("Checking status for command: {$commandName}");
        $this->checkCommandStatus($commandName);
    }
    
    /**
     * Check the status of a specific command
     */
    private function checkCommandStatus($commandName)
    {
        $latestLog = CronJobLog::latestExecution($commandName);
        
        if (!$latestLog) {
            $this->line("  No execution records found for: {$commandName}");
            return;
        }
        
        $this->line("  Command: {$commandName}");
        $this->line("  Last execution: " . $latestLog->completed_at->format('Y-m-d H:i:s'));
        $this->line("  Status: " . ($latestLog->success ? '✓ Success' : '✗ Failed'));
        
        if (!$latestLog->success && $latestLog->error_message) {
            $this->line("  Error: " . $latestLog->error_message);
        }
        
        // Check if execution is recent enough
        $minutesAgo = now()->diffInMinutes($latestLog->completed_at);
        if ($commandName === 'app:fetch-signatures' && $minutesAgo > 15) {
            $this->warn("  ⚠ Warning: Last execution was {$minutesAgo} minutes ago, expected every 10 minutes");
        } elseif ($commandName === 'app:run-cron-daily-jobs' && $minutesAgo > 1440) { // 24 hours
            $this->warn("  ⚠ Warning: Last execution was {$minutesAgo} minutes ago, expected daily");
        }
        
        $this->line("");
    }
}