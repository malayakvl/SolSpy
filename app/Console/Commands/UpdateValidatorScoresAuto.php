<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class UpdateValidatorScoresAuto extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'validators:update-scores-auto';

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
        $this->info('Updating validator scores automatically...');
        
        // Check if we should use SSH (for local development) or direct execution (for server)
        $useSSH = env('VALIDATOR_USE_SSH', false);
        
        if ($useSSH) {
            $this->info('Using SSH method (local development mode)');
            return Artisan::call('validators:update-scores-local', [], $this->getOutput());
        } else {
            $this->info('Using direct execution method (server mode)');
            return Artisan::call('validators:update-scores', [], $this->getOutput());
        }
    }
}