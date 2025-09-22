#!/bin/bash

# Deployment script to upload files to server
# Usage: ./deploy_to_server.sh

SERVER_HOST="103.167.235.81"
SERVER_USER="root"
PROJECT_PATH="/var/www/solspy"

echo "Deploying SolSpy files to server..."

# Upload the Laravel command
echo "Uploading Laravel command..."
scp app/Console/Commands/UpdateValidatorScores.php $SERVER_USER@$SERVER_HOST:$PROJECT_PATH/app/Console/Commands/

# Upload the migration
echo "Uploading migration..."
scp database/migrations/2025_09_22_230156_create_validator_scores_table.php $SERVER_USER@$SERVER_HOST:$PROJECT_PATH/database/migrations/

# Upload the updated controller
echo "Uploading updated controller..."
scp app/Http/Controllers/Api/ValidatorController.php $SERVER_USER@$SERVER_HOST:$PROJECT_PATH/app/Http/Controllers/Api/

echo "Deployment complete!"

echo "Next steps:"
echo "1. SSH into your server: ssh $SERVER_USER@$SERVER_HOST"
echo "2. Navigate to your project directory: cd $PROJECT_PATH"
echo "3. Run the migration: php artisan migrate"
echo "4. Test the command: php artisan validators:update-scores"
echo "5. Set up the cron job: crontab -e"
echo "   Add this line to run every 5 minutes:"
echo "   */5 * * * * cd $PROJECT_PATH && php artisan validators:update-scores >> /var/log/validator-update.log 2>&1"