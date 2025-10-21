<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Settings2User extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'data.settings2user';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'table_fields',
        'user_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'table_fields' => 'array',
    ];

    /**
     * Get the user that owns the settings.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}