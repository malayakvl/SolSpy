<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ValidatorMetric extends Model
{
    protected $table = 'data.validator_metrics';
    protected $fillable = [
        'vote_pubkey',
        'identity_pubkey',
        'current_slot',
        'tvc_rank',
        'timely_vote_rate',
        'avg_latency',
        'missed_votes',
        'uptime',
        'activated_stake',
        'tvc_earned',
        'last_vote',
    ];
}