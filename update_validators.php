#!/usr/bin/env php
<?php
// Script to update validator data in database
// This should be run as a cron job as root user

require_once 'vendor/autoload.php';

use Illuminate\Container\Container;
use Illuminate\Events\Dispatcher;
use Illuminate\Database\Connection;
use Illuminate\Database\Connectors\ConnectionFactory;

// Bootstrap Laravel database connection
$app = new \Illuminate\Container\Container;
$app->instance('app', $app);

// Database configuration (adjust as needed)
$config = [
    'driver'    => 'pgsql',
    'host'      => '127.0.0.1',
    'database'  => 'solspy_laravel',
    'username'  => 'your_db_username',
    'password'  => 'your_db_password',
    'charset'   => 'utf8',
    'collation' => 'utf8_unicode_ci',
    'prefix'    => '',
];

$connectionFactory = new ConnectionFactory($app);
$connection = $connectionFactory->make($config, 'default');

echo "Updating validator data...\n";

try {
    // Execute solana command to get all validators
    $command = "/usr/local/bin/solana validators -um --sort=credits -r -n";
    $output = shell_exec($command);
    
    if (empty($output)) {
        echo "Error: Failed to execute solana command\n";
        exit(1);
    }
    
    // Parse the output
    $lines = explode("\n", trim($output));
    $validators = [];
    
    foreach ($lines as $line) {
        $parts = preg_split('/\s+/', trim($line));
        if (count($parts) >= 17 && is_numeric($parts[0])) {
            $validators[] = [
                'rank' => (int)$parts[0],
                'vote_pubkey' => $parts[2],
                'node_pubkey' => $parts[3],
                'uptime' => $parts[4],
                'root_slot' => (int)str_replace(['(', ')'], '', $parts[5]),
                'vote_slot' => (int)str_replace(['(', ')'], '', $parts[8]),
                'commission' => (float)str_replace('%', '', $parts[11]),
                'credits' => (int)$parts[12],
                'version' => $parts[13],
                'stake' => $parts[14],
                'stake_percent' => str_replace(['(', ')', '%'], '', $parts[16]),
                'updated_at' => date('Y-m-d H:i:s')
            ];
        }
    }
    
    echo "Found " . count($validators) . " validators\n";
    
    // Clear existing data
    $connection->table('validator_scores')->truncate();
    
    // Insert new data
    foreach ($validators as $validator) {
        $connection->table('validator_scores')->insert($validator);
    }
    
    echo "Validator data updated successfully\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}