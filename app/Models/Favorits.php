<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Favorits extends Model
{
    //
    protected $fillable = [
        'user_id',
        'validator_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function validator()
    {
        return $this->belongsTo(Validator::class, 'validator_id');
    }
}
