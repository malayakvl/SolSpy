<?php

namespace App\Console\Commands\Rpc;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Artisan;
use Exception;

class FetchSettings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'rpc:fetch-settings';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch settings';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $useSSH = env('VALIDATOR_USE_SSH', false);
        if ($useSSH) {
            return Artisan::call('rpc:fetch-settings-local', [], $this->getOutput());
        } else {
            return Artisan::call('rpc:fetch-settings-server', [], $this->getOutput());
        }
    }
}