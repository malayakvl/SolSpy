<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Country extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'data.countries';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'iso',
        'name',
        'nicename',
        'iso3',
        'numcode',
        'phonecode',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'numcode' => 'integer',
        'created_at' => 'timestamp',
        'updated_at' => 'timestamp',
    ];

    /**
     * Scope a query to get country by ISO code.
     */
    public function scopeByIso($query, $iso)
    {
        return $query->where('iso', strtoupper($iso));
    }

    /**
     * Scope a query to get country by ISO3 code.
     */
    public function scopeByIso3($query, $iso3)
    {
        return $query->where('iso3', strtoupper($iso3));
    }

    /**
     * Get the display name (nicename or name as fallback).
     */
    public function getDisplayNameAttribute()
    {
        return $this->nicename ?: $this->name;
    }

    /**
     * Get formatted phone code with + prefix.
     */
    public function getFormattedPhoneCodeAttribute()
    {
        return $this->phonecode ? '+' . ltrim($this->phonecode, '+') : null;
    }
}