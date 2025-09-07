<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class News extends Model
{
    use HasFactory;

    protected $table = 'data.news';

    protected $fillable = [
        'slug',
        'status',
        'is_featured',
        'published_at',
        'image_url',
        'views_count'
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'published_at' => 'datetime',
        'views_count' => 'integer'
    ];

    /**
     * Get all translations for this news item
     */
    public function translations(): HasMany
    {
        return $this->hasMany(NewsTranslation::class);
    }

    /**
     * Get translation for specific language
     */
    public function translation(string $language = 'en')
    {
        return $this->translations()->where('language', $language)->first();
    }

    /**
     * Get translated title for specific language
     */
    public function getTitle(string $language = 'en'): ?string
    {
        return $this->translation($language)?->title;
    }

    /**
     * Get translated content for specific language
     */
    public function getContent(string $language = 'en'): ?string
    {
        return $this->translation($language)?->content;
    }

    /**
     * Get translated excerpt for specific language
     */
    public function getExcerpt(string $language = 'en'): ?string
    {
        return $this->translation($language)?->excerpt;
    }

    /**
     * Scope to get only published news
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published')
                    ->where('published_at', '<=', now());
    }

    /**
     * Scope to get featured news
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Increment view count
     */
    public function incrementViews(): void
    {
        $this->increment('views_count');
    }

    /**
     * Get available languages for this news item
     */
    public function getAvailableLanguages(): array
    {
        return $this->translations()->pluck('language')->toArray();
    }
}