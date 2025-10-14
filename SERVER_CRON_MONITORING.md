# Server Cron Monitoring Setup

This document explains how to monitor and verify cron jobs on your production server.

## 1. Database Migration

First, run the database migration to create the cron job logs table:

```bash
php artisan migrate
```

This will create a `cron_job_logs` table that tracks execution of cron jobs.

## 2. Modified Commands

The following commands now automatically log their execution:

- `app:run-cron-daily-jobs` - Daily jobs
- (You can modify other cron commands similarly)

## 3. Monitoring Commands

### Check cron status:
```bash
php artisan cron:check-status
```

### Check specific command:
```bash
php artisan cron:check-status --command=app:run-cron-daily-jobs
```

## 4. Server Check Script

Run the server check script to verify everything is working:

```bash
./server_cron_check.sh
```

This script will:
- Check database connection
- Verify cron job status
- Check system cron configuration
- Look for errors in logs

## 5. Setting Up System Cron

Make sure your system cron is configured correctly:

```bash
# Edit crontab
crontab -e
```

Add this line (adjust path as needed):
```bash
* * * * * cd /Users/viktoriakorogod/WEB/SolSpy && php artisan schedule:run >> /dev/null 2>&1
```

## 6. Manual Testing

To manually test if the scheduler works:

```bash
# Run scheduler manually
php artisan schedule:run
```

You should see output showing which commands would be executed.

## 7. Checking Execution Logs

View cron execution logs:

```bash
# View all cron logs
php artisan tinker
>>> App\Models\CronJobLog::all()->toArray();

# View logs for specific command
>>> App\Models\CronJobLog::forCommand('app:run-cron-daily-jobs')->get()->toArray();

# View successful executions only
>>> App\Models\CronJobLog::successful()->get()->toArray();
```

## 8. Monitoring from Browser

You can also create a simple web endpoint to check cron status:

Create a route in `routes/web.php`:
```php
Route::get('/cron-status', function () {
    $dailyJob = App\Models\CronJobLog::latestExecution('app:run-cron-daily-jobs');
    $signatureJob = App\Models\CronJobLog::latestExecution('app:fetch-signatures');
    
    return response()->json([
        'daily_job' => $dailyJob,
        'signature_job' => $signatureJob,
        'server_time' => now()->format('Y-m-d H:i:s')
    ]);
});
```

## 9. Troubleshooting

If cron jobs are not running:

1. **Check system cron is running:**
   ```bash
   # Check if cron daemon is active
   sudo launchctl list | grep com.apple.periodic
   ```

2. **Verify cron job syntax:**
   ```bash
   crontab -l
   ```

3. **Check file permissions:**
   ```bash
   ls -la artisan
   ```

4. **Test manually:**
   ```bash
   php artisan schedule:run
   ```

5. **Check logs:**
   ```bash
   tail -f storage/logs/laravel.log
   ```

## 10. Setting Up Alerts

You can modify the commands to send alerts when they fail:

In your command's handle method:
```php
catch (\Exception $e) {
    // Log the error
    // ... existing logging code ...
    
    // Send alert (email, Slack, etc.)
    // Mail::to('admin@example.com')->send(new CronFailedNotification($e->getMessage()));
    
    return 1;
}
```