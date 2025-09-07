<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NewsTranslation extends Model
{
    use HasFactory;

    protected $table = 'data.news_translations';

    protected $fillable = [
        'news_id',
        'language',
        'title',
        'excerpt',
        'content',
        'meta_tags'
    ];

    protected $casts = [
        'meta_tags' => 'array'
    ];

    /**
     * Get the news item that owns this translation
     */
    public function news(): BelongsTo
    {
        return $this->belongsTo(News::class);
    }

    /**
     * Get meta tag by key
     */
    public function getMetaTag(string $key): ?string
    {
        return $this->meta_tags[$key] ?? null;
    }

    /**
     * Set meta tag
     */
    public function setMetaTag(string $key, string $value): void
    {
        $metaTags = $this->meta_tags ?? [];
        $metaTags[$key] = $value;
        $this->meta_tags = $metaTags;
    }

    /**
     * Get SEO title (meta title or regular title)
     */
    public function getSeoTitle(): string
    {
        return $this->getMetaTag('title') ?? $this->title;
    }

    /**
     * Get SEO description (meta description or excerpt)
     */
    public function getSeoDescription(): ?string
    {
        return $this->getMetaTag('description') ?? $this->excerpt;
    }
}