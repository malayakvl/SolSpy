<?php

namespace App\Console\Commands\Validators;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class UpdateValidatorsSpyRank extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'validators:update-spy-rank';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update spy_rank for all validators using PostgreSQL function';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Updating spy_rank for all validators...');

        try {
            // Call the PostgreSQL function to update all validators
            $result = DB::select('SELECT data.update_all_validators_spy_rank() as updated_count');
            $updatedCount = $result[0]->updated_count;

            $this->info("Successfully updated spy_rank for {$updatedCount} validators.");
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Error updating spy_rank: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}