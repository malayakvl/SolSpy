<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NewsTopSorting extends Model
{
    protected $table = 'data.news_top_sorting';
    
    protected $fillable = [
        'news_id',
        'news_type',
        'sort_order'
    ];
    
    public $timestamps = true;
}