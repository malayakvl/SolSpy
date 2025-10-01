<?php

namespace App\Http\Controllers;

use App\Models\News;
use App\Models\NewsTranslation;
use App\Models\NewsTopSorting;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class NewsController extends Controller
{
    /**
     * Get top news items in the correct sort order
     */
    public function getTopNews()
    {
        // Get the current sort order from the news_top_sorting table
        $sortedItems = NewsTopSorting::orderBy('sort_order')
            ->get()
            ->map(function ($sortItem) {
                if ($sortItem->news_type === 'news') {
                    // Get news item from the news table
                    $newsItem = News::with('translations')->find($sortItem->news_id);
                    if ($newsItem) {
                        return [
                            'id' => $newsItem->id,
                            'type' => 'news',
                            'title' => $newsItem->translations->first()->title ?? 'Untitled',
                            'description' => $newsItem->translations->first()->excerpt ?? '',
                            'source' => 'News',
                            'url' => route('news.show', $newsItem->slug),
                            'published_at' => $newsItem->published_at,
                            'created_at' => $newsItem->created_at,
                            'updated_at' => $newsItem->updated_at,
                            'image_url' => $newsItem->image_url,
                        ];
                    }
                } else {
                    // Get news item from the discord_top_news table
                    $discordItem = DB::table('data.discord_top_news')->find($sortItem->news_id);
                    if ($discordItem) {
                        return [
                            'id' => $discordItem->id,
                            'type' => 'discord',
                            'title' => $discordItem->title,
                            'description' => $discordItem->description,
                            'source' => $discordItem->source,
                            'url' => $discordItem->url,
                            'published_at' => $discordItem->published_at,
                            'created_at' => $discordItem->created_at,
                            'updated_at' => $discordItem->updated_at,
                            'image_url' => null,
                        ];
                    }
                }
                return null;
            })
            ->filter() // Remove null items
            ->values(); // Re-index array

        return response()->json($sortedItems);
    }

    /**
     * Display a listing of news
     */
    public function index(Request $request): Response
    {
        $language = $request->get('lang', 'en');
        $perPage = $request->get('per_page', 10);
        
        $news = News::with(['translations' => function ($query) use ($language) {
                $query->where('language', $language);
            }])
            ->published()
            ->orderBy('published_at', 'desc')
            ->paginate($perPage);

        // Get featured news for homepage
        $featured = News::with(['translations' => function ($query) use ($language) {
                $query->where('language', $language);
            }])
            ->published()
            ->featured()
            ->orderBy('published_at', 'desc')
            ->limit(3)
            ->get();

        return Inertia::render('News/Index', [
            'news' => $news,
            'featured' => $featured,
            'language' => $language
        ]);
    }

    /**
     * Display admin listing of news
     */
    public function adminIndex(Request $request): Response
    {
        $query = News::with('translations');
        
        // Apply filters
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->whereHas('translations', function ($q) use ($search) {
                $q->where('title', 'ILIKE', "%{$search}%")
                  ->orWhere('content', 'ILIKE', "%{$search}%");
            });
        }
        
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        
        if ($request->has('is_featured') && ($request->is_featured === '1' || $request->is_featured === true)) {
            $query->where('is_featured', true);
        }
        
        $news = $query->orderBy('created_at', 'desc')
                     ->paginate($request->get('per_page', 15));

        return Inertia::render('News/Admin/Index', [
            'news' => $news,
            'filters' => $request->only(['search', 'status', 'is_featured'])
        ]);
    }

    /**
     * Show the form for creating a new news item
     */
    public function create(): Response
    {
        return Inertia::render('News/Admin/CreateEdit', [
            'isEdit' => false,
            'languages' => [
                ['code' => 'en', 'name' => 'English'],
                ['code' => 'ru', 'name' => 'Русский']
            ]
        ]);
    }

    /**
     * Store a newly created news item
     */
    public function store(Request $request): RedirectResponse
    {
        // Custom validation for slug uniqueness
        $slugExists = News::where('slug', $request->slug)->exists();
        
        if ($slugExists) {
            return back()->withErrors(['slug' => 'The slug has already been taken.']);
        }
        
        $validated = $request->validate([
            'slug' => 'required|string',
            'status' => 'required|in:draft,published,archived',
            'is_featured' => 'boolean',
            'image_url' => 'nullable|url',
            'translations' => 'required|array|min:1',
            'translations.*.language' => 'required|string|size:2',
            'translations.*.title' => 'required|string|max:255',
            'translations.*.excerpt' => 'nullable|string',
            'translations.*.content' => 'required|string',
            'translations.*.meta_tags' => 'nullable|array'
        ]);

        DB::transaction(function () use ($validated) {
            $news = News::create([
                'slug' => $validated['slug'],
                'status' => $validated['status'],
                'is_featured' => $validated['is_featured'] ?? false,
                'published_at' => $validated['status'] === 'published' ? now() : null,
                'image_url' => $validated['image_url'] ?? null,
                'sort_order' => 0, // Initialize sort_order
            ]);

            foreach ($validated['translations'] as $translation) {
                $news->translations()->create($translation);
            }
        });

        return redirect()->route('admin.news.index')
            ->with('success', 'News created successfully.');
    }

    /**
     * Display the specified news item
     */
    public function show(Request $request, string $slug): Response
    {
        $language = $request->get('lang', 'en');
        
        $article = News::with(['translations' => function ($query) use ($language) {
                $query->where('language', $language);
            }])
            ->where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

        // Get the translation or fallback to English
        $translation = $article->translations->first();
        if (!$translation && $language !== 'en') {
            $translation = $article->translations()->where('language', 'en')->first();
        }
        
        $article->translation = $translation;

        // Increment view count
        $article->incrementViews();

        // Get related articles
        $relatedArticles = News::with(['translations' => function ($query) use ($language) {
                $query->where('language', $language);
            }])
            ->where('status', 'published')
            ->where('id', '!=', $article->id)
            ->inRandomOrder()
            ->limit(3)
            ->get()
            ->map(function ($item) {
                $item->translation = $item->translations->first();
                return $item;
            });

        return Inertia::render('News/Show', [
            'article' => $article,
            'relatedArticles' => $relatedArticles,
            'language' => $language
        ]);
    }

    /**
     * Show the form for editing the specified news item
     */
    public function edit(News $news): Response
    {
        $news->load('translations');
        
        return Inertia::render('News/Admin/CreateEdit', [
            'article' => $news,
            'isEdit' => true,
            'languages' => [
                ['code' => 'en', 'name' => 'English'],
                ['code' => 'ru', 'name' => 'Русский']
            ]
        ]);
    }

    /**
     * Update the specified news item
     */
    public function update(Request $request, News $news): RedirectResponse
    {
        // Custom validation for slug uniqueness
        $slugExists = News::where('slug', $request->slug)
            ->where('id', '!=', $news->id)
            ->exists();
        
        if ($slugExists) {
            return back()->withErrors(['slug' => 'The slug has already been taken.']);
        }
        
        $validated = $request->validate([
            'slug' => 'required|string',
            'status' => 'required|in:draft,published,archived',
            'is_featured' => 'boolean',
            'image_url' => 'nullable|url',
            'translations' => 'required|array|min:1',
            'translations.*.language' => 'required|string|size:2',
            'translations.*.title' => 'required|string|max:255',
            'translations.*.excerpt' => 'nullable|string',
            'translations.*.content' => 'required|string',
            'translations.*.meta_tags' => 'nullable|array'
        ]);
        
        // Custom validation for translation IDs
        foreach ($request->get('translations', []) as $index => $translation) {
            if (isset($translation['id'])) {
                $translationExists = NewsTranslation::where('id', $translation['id'])
                    ->where('news_id', $news->id)
                    ->exists();
                if (!$translationExists) {
                    return back()->withErrors(["translations.{$index}.id" => 'Invalid translation ID.']);
                }
            }
        }

        DB::transaction(function () use ($validated, $news) {
            $news->update([
                'slug' => $validated['slug'],
                'status' => $validated['status'],
                'is_featured' => $validated['is_featured'] ?? false,
                'published_at' => $validated['status'] === 'published' && !$news->published_at ? now() : $news->published_at,
                'image_url' => $validated['image_url'] ?? null,
            ]);

            // Update or create translations
            foreach ($validated['translations'] as $translationData) {
                if (isset($translationData['id']) && $translationData['id']) {
                    // Update existing translation
                    $translation = NewsTranslation::findOrFail($translationData['id']);
                    $translation->update([
                        'title' => $translationData['title'],
                        'excerpt' => $translationData['excerpt'],
                        'content' => $translationData['content'],
                        'meta_tags' => $translationData['meta_tags'] ?? null,
                    ]);
                } else {
                    // Create new translation or update existing by language
                    $news->translations()->updateOrCreate(
                        ['language' => $translationData['language']],
                        [
                            'title' => $translationData['title'],
                            'excerpt' => $translationData['excerpt'],
                            'content' => $translationData['content'],
                            'meta_tags' => $translationData['meta_tags'] ?? null,
                        ]
                    );
                }
            }
        });

        return redirect()->route('admin.news.index')
            ->with('success', 'News updated successfully.');
    }

    /**
     * Remove the specified news item
     */
    public function destroy(News $news): RedirectResponse
    {
        $news->delete();

        return redirect()->route('admin.news.index')
            ->with('success', 'News deleted successfully.');
    }

    /**
     * Get featured news
     */
    public function featured(Request $request): Response
    {
        $language = $request->get('lang', 'en');
        
        $featured = News::with(['translations' => function ($query) use ($language) {
                $query->where('language', $language);
            }])
            ->where('status', 'published')
            ->where('is_featured', true)
            ->orderBy('published_at', 'desc')
            ->get()
            ->map(function ($item) {
                $item->translation = $item->translations->first();
                return $item;
            });

        return Inertia::render('News/Featured', [
            'featured' => $featured,
            'language' => $language
        ]);
    }

    /**
     * Handle bulk actions for admin
     */
    public function bulkAction(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'action' => 'required|in:publish,draft,feature,unfeature,delete,top',
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer'
        ]);
        
        // Custom validation for news IDs
        $validIds = News::whereIn('id', $validated['ids'])->pluck('id')->toArray();
        $invalidIds = array_diff($validated['ids'], $validIds);
        
        if (!empty($invalidIds)) {
            return back()->withErrors(['ids' => 'Some news IDs are invalid: ' . implode(', ', $invalidIds)]);
        }

        $action = $validated['action'];
        $ids = $validated['ids'];
        $count = 0;

        switch ($action) {
            case 'publish':
                $count = News::whereIn('id', $ids)->update([
                    'status' => 'published',
                    'published_at' => now()
                ]);
                break;
                
            case 'draft':
                $count = News::whereIn('id', $ids)->update(['status' => 'draft']);
                break;
                
            case 'feature':
                $count = News::whereIn('id', $ids)->update(['is_featured' => true]);
                break;
                
            case 'unfeature':
                $count = News::whereIn('id', $ids)->update(['is_featured' => false]);
                break;
                
            case 'delete':
                $count = News::whereIn('id', $ids)->delete();
                break;

            case 'top':
                // Toggle is_top status for news items using DB query for efficiency
                News::whereIn('id', $ids)->update([
                    'is_top' => DB::raw('NOT is_top')
                ]);
                
                // Also update the sorting table
                // For items that are now top news, add them to the sorting table
                // For items that are no longer top news, remove them from the sorting table
                $toggledItems = News::whereIn('id', $ids)->get();
                foreach ($toggledItems as $item) {
                    if ($item->is_top) {
                        // Add to sorting table with highest sort order
                        $maxSortOrder = NewsTopSorting::max('sort_order') ?? 0;
                        NewsTopSorting::create([
                            'news_id' => $item->id,
                            'news_type' => 'news',
                            'sort_order' => $maxSortOrder + 1
                        ]);
                    } else {
                        // Remove from sorting table
                        NewsTopSorting::where('news_id', $item->id)
                            ->where('news_type', 'news')
                            ->delete();
                    }
                }
                break;
        }

        return redirect()->route('admin.news.index')
            ->with('success', "Bulk {$action} completed successfully. {$count} items affected.");
    }

    /**
     * Display the sort top news page with combined data from news and discord_top_news tables
     */
    public function sortTopNews(Request $request): Response
    {
        // Check if we have any sorting records, if not, populate with current top news
        if (NewsTopSorting::count() === 0) {
            DB::transaction(function () {
                // Get all top news items from regular news table
                $topNewsItems = News::where('is_top', true)->get();
                
                // Add regular news items to sorting table
                foreach ($topNewsItems as $index => $newsItem) {
                    NewsTopSorting::create([
                        'news_id' => $newsItem->id,
                        'news_type' => 'news',
                        'sort_order' => $index
                    ]);
                }
                
                // Get all top news items from discord_top_news table
                $topDiscordItems = DB::table('data.discord_top_news')->get();
                
                // Add Discord news items to sorting table
                $startIndex = $topNewsItems->count();
                foreach ($topDiscordItems as $index => $discordItem) {
                    NewsTopSorting::create([
                        'news_id' => $discordItem->id,
                        'news_type' => 'discord',
                        'sort_order' => $startIndex + $index
                    ]);
                }
            });
        }
        
        // Get the current sort order from the news_top_sorting table
        $sortedItems = NewsTopSorting::orderBy('sort_order')
            ->get()
            ->map(function ($sortItem) {
                if ($sortItem->news_type === 'news') {
                    // Get news item from the news table
                    $newsItem = News::with('translations')->find($sortItem->news_id);
                    if ($newsItem) {
                        return [
                            'id' => $newsItem->id,
                            'type' => 'news',
                            'title' => $newsItem->translations->first()->title ?? 'Untitled',
                            'description' => $newsItem->translations->first()->excerpt ?? '',
                            'source' => 'News',
                            'url' => route('news.show', $newsItem->slug),
                            'published_at' => $newsItem->published_at,
                            'created_at' => $newsItem->created_at,
                            'updated_at' => $newsItem->updated_at,
                            'image_url' => $newsItem->image_url,
                        ];
                    }
                } else {
                    // Get news item from the discord_top_news table
                    $discordItem = DB::table('data.discord_top_news')->find($sortItem->news_id);
                    if ($discordItem) {
                        return [
                            'id' => $discordItem->id,
                            'type' => 'discord',
                            'title' => $discordItem->title,
                            'description' => $discordItem->description,
                            'source' => $discordItem->source,
                            'url' => $discordItem->url,
                            'published_at' => $discordItem->published_at,
                            'created_at' => $discordItem->created_at,
                            'updated_at' => $discordItem->updated_at,
                            'image_url' => null,
                        ];
                    }
                }
                return null;
            })
            ->filter(); // Remove null items

        return Inertia::render('News/Admin/SortTop', [
            'topNews' => $sortedItems
        ]);
    }

    /**
     * Generate slug from title
     */
    public function generateSlug(Request $request)
    {
        $title = $request->get('title', '');
        $slug = Str::slug($title);
        
        // Ensure uniqueness
        $originalSlug = $slug;
        $counter = 1;
        while (News::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return response()->json(['slug' => $slug]);
    }
}