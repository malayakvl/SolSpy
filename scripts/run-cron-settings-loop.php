<?php

require __DIR__ . '/../vendor/autoload.php';

use Illuminate\Support\Facades\Artisan;

while (true) {
    Artisan::call('rpc:fetch-settings');
    echo "rpc:fetch-settings ran at " . date('Y-m-d H:i:s') . "\n";
    sleep(1);
}
