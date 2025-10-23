<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Settings extends Model
{
    //
    protected $table = 'data.settings';

    // Ensure the model uses timestamps
    public $timestamps = true;

    protected $fillable = [
        'table_fields',
    ];

    protected $casts = [
        'table_fields' => 'array',
    ];
}