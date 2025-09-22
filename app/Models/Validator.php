<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
}