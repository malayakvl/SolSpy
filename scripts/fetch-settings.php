<?php

require __DIR__ . '/../vendor/autoload.php';

use Illuminate\Support\Facades\Artisan;

while (true) {
    Artisan::call('app:fetch-settings');
    echo "app:fetch-settings ran at " . date('Y-m-d H:i:s') . "\n";
    sleep(12 * 60 * 60); // Задержка 12 часов
}
