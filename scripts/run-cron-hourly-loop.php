<?php

require __DIR__ . '/../vendor/autoload.php';

use Illuminate\Support\Facades\Artisan;

while (true) {
    Artisan::call('rpc:fetch-sfdp');
    echo "rpc:fetch-sfdp ran at " . date('Y-m-d H:i:s') . "\n";
    sleep(3600); // Задержка 1 час
}