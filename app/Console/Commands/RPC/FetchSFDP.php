<?php

namespace App\Console\Commands\Rpc;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

class FetchSFDP extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'rpc:fetch-sfdp';

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
        $this->info("Updating validator sfdp status");
        
        // Check if we should use SSH (for local development) or direct execution (for server)
        $useSSH = env('VALIDATOR_USE_SSH', false);
        
        if ($useSSH) {
            return Artisan::call('rpc:fetch-sfdp-local', [], $this->getOutput());
        } else {
            return Artisan::call('rpc:fetch-sfdp-server', [], $this->getOutput());
        }
    }
}