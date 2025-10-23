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
        'sol_rate',
        'epoch',
        'epoch_completed_percent',
        'epoch_completed_time',
        'epoch_total_time',
        'epoch_remaining_time',
    ];

    protected $casts = [
        'sol_rate' => 'float',
        'epoch' => 'float',
        'epoch_completed_percent' => 'decimal:2',
    ];
}