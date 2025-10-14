#!/bin/bash

# Server Cron Check Script
# This script checks if cron jobs are running properly on the server

# Configuration
PROJECT_PATH="/Users/viktoriakorogod/WEB/SolSpy"
LOG_FILE="$PROJECT_PATH/storage/logs/cron-check.log"
EMAIL="your-email@example.com"  # Change this to your email

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Start check
log_message "Starting cron check..."

# Check if project directory exists
if [ ! -d "$PROJECT_PATH" ]; then
    log_message "ERROR: Project directory not found: $PROJECT_PATH"
    exit 1
fi

# Change to project directory
cd "$PROJECT_PATH"

# Check if PHP is available
if ! command -v php &> /dev/null; then
    log_message "ERROR: PHP is not installed or not in PATH"
    exit 1
fi

# Check if artisan exists
if [ ! -f "artisan" ]; then
    log_message "ERROR: artisan file not found"
    exit 1
fi

# Check database connection
log_message "Checking database connection..."
php artisan tinker --execute="echo DB::connection()->getPdo() ? 'Database connection OK' : 'Database connection failed';"

# Check cron job status
log_message "Checking cron job status..."
php artisan cron:check-status

# Check system cron jobs
log_message "Checking system cron jobs..."
crontab -l > /dev/null 2>&1
if [ $? -eq 0 ]; then
    log_message "System cron jobs:"
    crontab -l | grep -v "^#" | grep "schedule:run" || log_message "No Laravel scheduler found in crontab"
else
    log_message "WARNING: Cannot read crontab (may need sudo)"
fi

# Check Laravel logs for recent errors
log_message "Checking for recent errors in Laravel logs..."
tail -n 50 storage/logs/laravel.log | grep "ERROR\|CRITICAL\|ALERT" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    log_message "Recent errors found in Laravel logs:"
    tail -n 50 storage/logs/laravel.log | grep "ERROR\|CRITICAL\|ALERT" | tail -n 5
else
    log_message "No recent errors found in Laravel logs"
fi

log_message "Cron check completed."

# Optional: Send email notification (uncomment if needed)
# echo "Cron check completed. Check $LOG_FILE for details." | mail -s "Cron Check Report" "$EMAIL"