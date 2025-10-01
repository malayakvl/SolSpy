<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Validator extends Model
{
    use HasFactory;

    protected $table = 'data.validators';

    protected $fillable = [
        'vote_pubkey',
        'node_pubkey',
        'identity_pubkey',
        'commission',
        'active_stake',
        'stake_weight',
        'stake_weight_percentage',
        'total_stake',
        'total_stake_percentage',
        'commission_percentage',
        'apy',
        'apy_percentage',
        'apy_rank',
        'apy_rank_percentage',
        'uptime',
        'uptime_percentage',
        'uptime_rank',
        'uptime_rank_percentage',
        'spy_rank',
    ];

    protected $casts = [
        'commission' => 'decimal:2',
        'active_stake' => 'decimal:2',
        'stake_weight' => 'decimal:2',
        'stake_weight_percentage' => 'decimal:2',
        'total_stake' => 'decimal:2',
        'total_stake_percentage' => 'decimal:2',
        'commission_percentage' => 'decimal:2',
        'apy' => 'decimal:2',
        'apy_percentage' => 'decimal:2',
        'apy_rank' => 'decimal:2',
        'apy_rank_percentage' => 'decimal:2',
        'uptime' => 'decimal:2',
        'uptime_percentage' => 'decimal:2',
        'uptime_rank' => 'decimal:2',
        'uptime_rank_percentage' => 'decimal:2',
        'spy_rank' => 'decimal:2',
    ];

    /**
     * Get the order records for this validator.
     */
    public function orderRecords()
    {
        return $this->hasMany(ValidatorOrder::class);
    }
    
    /**
     * Get the scores for this validator.
     */
    public function scores()
    {
        return $this->hasMany(ValidatorScore::class, 'vote_pubkey', 'vote_pubkey');
    }
    
    /**
     * Calculate the average rank for this validator.
     */
    public function calculateAverageRank()
    {
        // Direct query approach to debug the issue
        $averageRank = DB::table('data.validator_scores')
            ->where('vote_pubkey', $this->vote_pubkey)
            ->avg('rank');
            
        return $averageRank;
    }
    
    /**
     * Get the latest version for this validator from scores.
     */
    public function getLatestVersion()
    {
        // Direct query approach to debug the issue
        $latestScore = DB::table('data.validator_scores')
            ->where('vote_pubkey', $this->vote_pubkey)
            ->orderBy('id', 'desc')
            ->first();

        return $latestScore ? $latestScore->version : null;
    }
}