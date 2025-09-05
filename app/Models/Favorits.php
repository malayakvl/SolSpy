<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Favorits extends Model
{
    /**
     * The table associated with the model.
     */
    protected $table = 'data.favorites';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'validator_id',
    ];

    /**
     * Get the user that owns the favorite.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the validator that is favorited.
     */
    public function validator()
    {
        return $this->belongsTo(Validator::class, 'validator_id');
    }
}
