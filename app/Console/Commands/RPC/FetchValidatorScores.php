<?php

namespace App\Console\Commands\Rpc;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

class FetchValidatorScores extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'rpc:fetch-validator-scores';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update validator scores history automatically based on environment configuration';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $dbSettings = DB::table('data.settings')->first();
        $collectLength = $dbSettings->collect_score_retention;

        $this->info("Updating validator scores history automatically (keeping last $collectLength collections)...");
        
        // Check if we should use SSH (for local development) or direct execution (for server)
        $useSSH = env('VALIDATOR_USE_SSH', false);
        $this->info('use SSH', $useSSH);
        if ($useSSH) {
            return Artisan::call('rpc:fetch-validator-scores-local', [], $this->getOutput());
        } else {
            return Artisan::call('rpc:fetch-validator-scores-server', [], $this->getOutput());
        }
    }
}