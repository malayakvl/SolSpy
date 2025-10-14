#!/usr/bin/env php
<?php

// Simple script to check cron job status
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

// Check if log file exists
$logFile = __DIR__.'/storage/logs/cron-test.log';

echo "=== Cron Job Status Check ===\n";

if (file_exists($logFile)) {
    echo "✓ Test cron log file exists\n";
    
    // Read last 10 lines of the log file
    $lines = file($logFile);
    $lastLines = array_slice($lines, -10);
    
    echo "Last 10 executions:\n";
    foreach ($lastLines as $line) {
        echo "  " . trim($line) . "\n";
    }
    
    // Check when the last execution was
    if (!empty($lastLines)) {
        $lastLine = trim(end($lastLines));
        $lastExecution = substr($lastLine, 0, 19); // Extract timestamp
        echo "\nLast execution: " . $lastExecution . "\n";
        
        // Calculate time difference
        $lastTime = strtotime($lastExecution);
        $currentTime = time();
        $diff = $currentTime - $lastTime;
        
        if ($diff < 120) { // Less than 2 minutes
            echo "✓ Cron is working correctly (last run was " . floor($diff/60) . " minutes ago)\n";
        } else {
            echo "⚠ Warning: Cron may not be running correctly (last run was " . floor($diff/60) . " minutes ago)\n";
        }
    }
} else {
    echo "⚠ Test cron log file does not exist yet\n";
    echo "Please wait a few minutes for the cron job to execute\n";
}

echo "\n=== How to check system cron ===\n";
echo "Run these commands on your server:\n";
echo "  crontab -l                    # List current cron jobs\n";
echo "  tail -f storage/logs/laravel.log # Watch Laravel logs\n";
echo "  tail -f storage/logs/cron-test.log # Watch test cron logs\n";