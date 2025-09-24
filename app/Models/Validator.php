<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Validator extends Model
{
    protected $table = 'data.validators';
    
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