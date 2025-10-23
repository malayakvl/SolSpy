<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class UpdateValidatorSfdpStatusAuto extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'validators:update-sfdp-status-auto';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update validator sfdp automatically based on environment configuration';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        // Check if we should use SSH (for local development) or direct execution (for server)
        $useSSH = env('VALIDATOR_USE_SSH', false);
        if ($useSSH) {
            return Artisan::call('validators:update-sfdp-status-local');
        } else {
            return Artisan::call('validators:update-sfdp-status');
        }
    }
}