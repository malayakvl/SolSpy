#!/bin/bash

# Simple verification script for validator commands

echo "Verifying Validator Commands"
echo "==========================="

# Check if we're on the server or local machine
if [ "$VALIDATOR_USE_SSH" = "false" ] || [ -z "$VALIDATOR_USE_SSH" ]; then
    echo "Running in server mode (direct execution)"
    echo "Command to test: php artisan validators:update-scores"
else
    echo "Running in local mode (SSH connection)"
    echo "Command to test: php artisan validators:update-scores-local"
fi

echo ""
echo "Auto command (chooses the right method automatically):"
echo "Command to test: php artisan validators:update-scores-auto"

echo ""
echo "To verify the commands work:"
echo "1. Check that the commands exist:"
echo "   php artisan list | grep validators"
echo ""
echo "2. Run the appropriate command 4 times"
echo "3. Check the database to verify only last 3 collections remain"