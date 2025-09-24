#!/usr/bin/env php
<?php
// Test script for validator commands
// This script tests the different validator score update commands

require_once 'vendor/autoload.php';

use Illuminate\Container\Container;
use Illuminate\Events\Dispatcher;
use Illuminate\Database\Connection;
use Illuminate\Database\Connectors\ConnectionFactory;

echo "Testing Validator Score Commands\n";
echo "===============================\n\n";

// Test 1: Check environment configuration
echo "1. Checking environment configuration...\n";
$useSSH = env('VALIDATOR_USE_SSH', false);
echo "VALIDATOR_USE_SSH: " . ($useSSH ? 'true' : 'false') . "\n";
echo "VALIDATOR_SERVER_HOST: " . env('VALIDATOR_SERVER_HOST', 'not set') . "\n";
echo "VALIDATOR_SERVER_USER: " . env('VALIDATOR_SERVER_USER', 'not set') . "\n";
echo "\n";

// Test 2: Check if required files exist
echo "2. Checking required files...\n";
$files = [
    'app/Console/Commands/UpdateValidatorScores.php',
    'app/Console/Commands/UpdateValidatorScoresLocal.php',
    'app/Console/Commands/UpdateValidatorScoresAuto.php'
];

foreach ($files as $file) {
    if (file_exists($file)) {
        echo "  ✓ $file exists\n";
    } else {
        echo "  ✗ $file missing\n";
    }
}
echo "\n";

// Test 3: Check database migration
echo "3. Checking database migration...\n";
$migrationFile = 'database/migrations/2025_09_22_230156_create_validator_scores_table.php';
if (file_exists($migrationFile)) {
    echo "  ✓ Migration file exists\n";
    
    // Check if it contains the collected_at field
    $content = file_get_contents($migrationFile);
    if (strpos($content, 'collected_at') !== false) {
        echo "  ✓ Migration includes collected_at field\n";
    } else {
        echo "  ✗ Migration missing collected_at field\n";
    }
} else {
    echo "  ✗ Migration file missing\n";
}
echo "\n";

// Test 4: Check symbolic link
echo "4. Checking symbolic link...\n";
if (file_exists('/usr/local/bin/solana')) {
    echo "  ✓ Symbolic link exists\n";
    
    // Check if it points to the correct location
    if (is_link('/usr/local/bin/solana')) {
        $linkTarget = readlink('/usr/local/bin/solana');
        echo "  ✓ Symbolic link points to: $linkTarget\n";
    } else {
        echo "  ! /usr/local/bin/solana exists but is not a symbolic link\n";
    }
} else {
    echo "  ! Symbolic link not found (this is expected on local development machine)\n";
}
echo "\n";

echo "Test completed!\n";
echo "To test the commands:\n";
echo "  php artisan validators:update-scores-auto\n";
echo "  php artisan validators:update-scores-local\n";
echo "  php artisan validators:update-scores\n";