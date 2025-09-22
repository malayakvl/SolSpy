<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DiscordNews extends Model
{
    protected $table = 'data.discord_news';
    
    protected $fillable = [
        'title',
        'content',
        'url',
        'author',
        'published_at',
        'image_url',
        'sort_order',
        'is_top' // Add is_top field
    ];
    
    protected $casts = [
        'published_at' => 'datetime',
        'is_top' => 'boolean', // Cast is_top to boolean
    ];
}