<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CronJobLog extends Model
{
    use HasFactory;

    protected $table = 'cron_job_logs';

    protected $fillable = [
        'command_name',
        'started_at',
        'completed_at',
        'success',
        'output',
        'error_message',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'success' => 'boolean',
    ];

    /**
     * Scope a query to only include logs for a specific command.
     */
    public function scopeForCommand($query, $commandName)
    {
        return $query->where('command_name', $commandName);
    }

    /**
     * Scope a query to only include successful executions.
     */
    public function scopeSuccessful($query)
    {
        return $query->where('success', true);
    }

    /**
     * Get the latest execution log for a command.
     */
    public static function latestExecution($commandName)
    {
        return self::forCommand($commandName)
            ->orderBy('completed_at', 'desc')
            ->first();
    }
}