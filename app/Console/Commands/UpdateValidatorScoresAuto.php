<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

class UpdateValidatorScoresAuto extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'validators:update-scores-auto {collectLength=3 : Number of collections to keep}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update validator scores automatically based on environment configuration';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $dbSettings = DB::table('data.settings')->first();
        $collectLength = $dbSettings->collect_score_retention;

        $this->info("Updating validator scores automatically (keeping last $collectLength collections)...");
        
        // Check if we should use SSH (for local development) or direct execution (for server)
        $useSSH = env('VALIDATOR_USE_SSH', false);
        
        if ($useSSH) {
            return Artisan::call('validators:update-scores-local', ['collectLength' => $collectLength], $this->getOutput());
        } else {
            return Artisan::call('validators:update-scores', ['collectLength' => $collectLength], $this->getOutput());
        }
    }
}