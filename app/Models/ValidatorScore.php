<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ValidatorScore extends Model
{
    protected $table = 'data.validator_scores';
    
    protected $fillable = [
        'rank',
        'vote_pubkey',
        'node_pubkey',
        'uptime',
        'root_slot',
        'vote_slot',
        'commission',
        'credits',
        'version',
        'stake',
        'stake_percent',
        'collected_at',
    ];
    
    /**
     * The name of the "created at" column.
     *
     * @var string
     */
    const CREATED_AT = 'created_at';
    
    /**
     * The name of the "updated at" column.
     *
     * @var string
     */
    const UPDATED_AT = 'updated_at';
    
    /**
     * Get the validator that owns this score.
     */
    public function validator()
    {
        return $this->belongsTo(Validator::class, 'vote_pubkey', 'vote_pubkey');
    }
}