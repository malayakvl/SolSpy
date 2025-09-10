<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\News;
use App\Models\NewsTranslation;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log; // Added missing import
use Illuminate\Support\Facades\Http; // Added missing import

class DiscordController extends Controller
{
    //
    public function adminIndex(Request $request): Response {
        $query = $request->input('query', 'Discord'); // Default query: Discord
        $limit = $request->input('limit', 20); // Default limit: 20 articles
        $page = $request->input('page', 1); // Default page: 1
        // $newsApiKey = config('services.newsapi.key');
        $newsApiKey = '717a7ac2f8224744bf034d2d37a5f882';


        try {
            $response = Http::withHeaders(['User-Agent' => 'NewsBot/1.0'])
                ->get('https://newsapi.org/v2/everything', [
                    'q' => $query,
                    'apiKey' => $newsApiKey,
                    'language' => 'en',
                    'sortBy' => 'publishedAt',
                    'pageSize' => $limit,
                    'page' => $page,
                ]);

            if ($response->failed()) {
                Log::error('NewsAPI request failed', ['status' => $response->status()]);
                return Inertia::render('News/Error', ['message' => 'Failed to fetch news. HTTP Code: ' . $response->status()]);
            }

            $articles = $response->json('articles', []);
            $totalResults = $response->json('totalResults', 0);
            
            if (empty($articles)) {
                return Inertia::render('News/Error', ['message' => 'No news found']);
            }

            // Format articles for response
            $formattedArticles = array_map(function ($article) {
                return [
                    'title' => $article['title'] ?? 'No title',
                    'url' => $article['url'] ?? '',
                    'description' => substr($article['description'] ?? 'No description', 0, 100) . (strlen($article['description'] ?? '') > 100 ? '...' : ''),
                    'source' => $article['source']['name'] ?? 'Unknown source',
                    'published_at' => $article['publishedAt'] ?? now()->toIso8601String(),
                ];
            }, $articles);

            // Prepare paginated response
            $paginatedData = [
                'data' => $formattedArticles,
                'current_page' => $page,
                'last_page' => ceil($totalResults / $limit),
                'per_page' => $limit,
                'total' => $totalResults,
            ];

            // return response()->json([
            //     'message' => 'News fetched successfully',
            //     'articles' => $formattedArticles,
            // ], 200);
        } catch (\Exception $e) {
            Log::error('Error in fetchNews', ['message' => $e->getMessage()]);
            return Inertia::render('News/Error', ['message' => 'An error occurred: ' . $e->getMessage()], 500);
        }
        
        return Inertia::render('DiscordNews/Index', [
            'news' => $paginatedData,
        ]);
        
    }
}