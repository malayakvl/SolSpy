<?php

require __DIR__ . '/../vendor/autoload.php';

// Инициализация приложения Laravel
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Artisan;

while (true) {
    Artisan::call('app:run-cron-dayly-jobs');
    echo "app:run-cron-jobs ran at " . date('Y-m-d H:i:s') . "\n";
    sleep(86400); // Задержка 24 часа (86400 секунд)
}