<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ValidatorOrder extends Model
{
    protected $table = 'data.validator_order';
    
    protected $fillable = [
        'validator_id',
        'sort_order',
        'list_type'
    ];
    
    /**
     * Get the validator that owns this order record.
     */
    public function validator()
    {
        return $this->belongsTo(Validator::class);
    }
}