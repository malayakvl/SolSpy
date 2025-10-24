<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

while (true) {
    Log::channel('cron-settings')->info('Running rpc:fetch-settings-server');
    
    $exitCode = Artisan::call('rpc:fetch-settings-server');
    
    if ($exitCode !== 0) {
        Log::channel('cron-settings')->error('rpc:fetch-settings-server failed', [
            'exit_code' => $exitCode,
            'output' => Artisan::output()
        ]);
    }
    
    sleep(60);
}