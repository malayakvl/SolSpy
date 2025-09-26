#!/bin/bash

# Git-based deployment script
# This script should be run from your local development environment

echo "Deploying SolSpy to server via Git..."

# Add all new files to git (they should already be added, but just in case)
git add app/Console/Commands/UpdateValidatorScores.php
git add app/Console/Commands/UpdateValidatorScoresLocal.php
git add app/Console/Commands/UpdateValidatorScoresAuto.php
git add database/migrations/2025_09_22_230156_create_validator_scores_table.php
git add deploy.sh

# Commit the changes
git commit -m "Add validator score update functionality with environment-specific commands"

# Push to remote repository
git push origin main

echo "Code deployed to Git repository!"

echo "Next steps on the server:"
echo "1. SSH into your server: ssh root@103.167.235.81"
echo "2. Navigate to your project directory: cd /var/www/solspy"
echo "3. Pull the latest changes: git pull origin main"
echo "4. Run the migration: php artisan migrate"
echo "5. Test the commands:"
echo "   For direct execution (server mode): php artisan validators:update-scores"
echo "   For automatic mode: php artisan validators:update-scores-auto"
echo "6. Set up the cron job: crontab -e"
echo "   Add this line to run every 5 minutes:"
echo "   */5 * * * * cd /var/www/solspy && php artisan validators:update-scores-auto >> /var/log/validator-update.log 2>&1"