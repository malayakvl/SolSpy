# Cron Setup Instructions

## 1. Verify Laravel Scheduler is Working

First, let's test if the Laravel scheduler is working correctly:

```bash
# Run this command to test the scheduler manually
php artisan schedule:run
```

You should see output showing which commands would be run.

## 2. Set Up System Cron Job

The Laravel scheduler requires one system cron job that runs every minute. Add this to your crontab:

```bash
# Edit your crontab
crontab -e
```

Add this line to the crontab file:
```bash
* * * * * cd /path/to/your/project && php artisan schedule:run >> /dev/null 2>&1
```

Replace `/path/to/your/project` with the actual path to your SolSpy project.

For your system, it would likely be:
```bash
* * * * * cd /Users/viktoriakorogod/WEB/SolSpy && php artisan schedule:run >> /dev/null 2>&1
```

## 3. Verify Cron Jobs are Set

Check that your cron jobs are properly configured:

```bash
# List current cron jobs
crontab -l
```

## 4. Monitor Cron Execution

We've set up a test cron job that runs every minute. You can monitor its execution in several ways:

### Check the test log file:
```bash
# Watch the test cron log
tail -f storage/logs/cron-test.log
```

### Check Laravel logs:
```bash
# Watch Laravel logs
tail -f storage/logs/laravel.log
```

### Use our check script:
```bash
# Run the check script
php check_cron_status.php
```

## 5. Troubleshooting

If cron jobs are not running:

1. **Check if cron daemon is running:**
   ```bash
   # On macOS
   sudo launchctl list | grep com.apple.periodic
   ```

2. **Verify PHP path:**
   ```bash
   which php
   ```
   If needed, update the cron job with the full PHP path:
   ```bash
   * * * * * cd /Users/viktoriakorogod/WEB/SolSpy && /usr/bin/php artisan schedule:run >> /dev/null 2>&1
   ```

3. **Check file permissions:**
   ```bash
   ls -la artisan
   ```
   The artisan file should be executable.

4. **Test manually:**
   ```bash
   php artisan app:test-cron-job
   ```
   This should create an entry in `storage/logs/cron-test.log`.

## 6. Current Scheduled Jobs

Your current scheduled jobs are:
- `app:run-cron-daily-jobs` - Runs daily
- `app:fetch-signatures` - Runs every 10 minutes
- `app:test-cron-job` - Runs every minute (for testing)

After confirming cron is working, you can remove the test job by:
1. Commenting out or removing the test job line in `app/Console/Kernel.php`
2. Running `php artisan config:cache`