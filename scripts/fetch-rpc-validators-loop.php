<?php

require __DIR__ . '/../vendor/autoload.php';

// Инициализация приложения Laravel
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Artisan;

while (true) {
    Artisan::call('rpc:fetch-validators');
    echo "rpc:fetch-validators ran at " . date('Y-m-d H:i:s') . "\n";
    sleep(2); // Задержка 2 секунды
}