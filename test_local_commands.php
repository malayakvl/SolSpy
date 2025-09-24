#!/usr/bin/env php
<?php
// Simple test script to verify command structure

echo "Testing Validator Commands Structure\n";
echo "==================================\n\n";

// Check if the command files exist
$commands = [
    'app/Console/Commands/UpdateValidatorScores.php',
    'app/Console/Commands/UpdateValidatorScoresLocal.php',
    'app/Console/Commands/UpdateValidatorScoresAuto.php'
];

echo "Checking command files:\n";
foreach ($commands as $command) {
    if (file_exists($command)) {
        echo "  ✓ $command exists\n";
    } else {
        echo "  ✗ $command missing\n";
    }
}

echo "\nChecking migration file:\n";
$migration = 'database/migrations/2025_09_22_230156_create_validator_scores_table.php';
if (file_exists($migration)) {
    echo "  ✓ $migration exists\n";
} else {
    echo "  ✗ $migration missing\n";
}

echo "\nTo test the commands locally:\n";
echo "1. Make sure your .env has VALIDATOR_USE_SSH=true for local testing\n";
echo "2. Run: php artisan validators:update-scores-local\n";
echo "3. Run it 4 times and verify that only the last 3 collections are kept\n";

echo "\nFor production server testing:\n";
echo "1. Set VALIDATOR_USE_SSH=false in .env\n";
echo "2. Run: php artisan validators:update-scores\n";
echo "3. Run it 4 times and verify that only the last 3 collections are kept\n";

echo "\nTo test automatic mode:\n";
echo "1. Run: php artisan validators:update-scores-auto\n";
echo "   (This will automatically choose the right method based on VALIDATOR_USE_SSH)\n";