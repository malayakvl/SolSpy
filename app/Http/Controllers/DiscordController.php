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

        // Initialize default response data
        $paginatedData = [
            'data' => [],
            'current_page' => (int)$page,
            'last_page' => 1,
            'per_page' => (int)$limit,
            'total' => 0,
        ];

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
            
            Log::info('NewsAPI Response Status', ['status' => $response->status()]);
            Log::info('NewsAPI Response Headers', ['headers' => $response->headers()]);
            
            if ($response->failed()) {
                Log::error('NewsAPI request failed', ['status' => $response->status(), 'body' => $response->body()]);
                $paginatedData['error'] = 'Failed to fetch news. HTTP Code: ' . $response->status();
                return Inertia::render('DiscordNews/Admin/Index', [
                    'news' => $paginatedData
                ]);
            }

            $responseData = $response->json();
            Log::info('NewsAPI Response Structure', [
                'keys' => array_keys($responseData ?? []),
                'status' => $responseData['status'] ?? 'unknown',
                'totalResults' => $responseData['totalResults'] ?? 0
            ]);

            $articles = $responseData['articles'] ?? [];
            $totalResults = $responseData['totalResults'] ?? 0;
            
            Log::info('Articles count', ['count' => count($articles)]);
            Log::info('Total results', ['total' => $totalResults]);
            
            // Format articles for response and ensure proper UTF-8 encoding
            $formattedArticles = array_map(function ($article) {
                return [
                    'title' => mb_convert_encoding($article['title'] ?? 'No title', 'UTF-8', 'UTF-8'),
                    'url' => mb_convert_encoding($article['url'] ?? '', 'UTF-8', 'UTF-8'),
                    'description' => mb_substr(mb_convert_encoding($article['description'] ?? 'No description', 'UTF-8', 'UTF-8'), 0, 100) . (mb_strlen($article['description'] ?? '') > 100 ? '...' : ''),
                    'source' => mb_convert_encoding($article['source']['name'] ?? 'Unknown source', 'UTF-8', 'UTF-8'),
                    'published_at' => $article['publishedAt'] ?? now()->toIso8601String(),
                    'views_count' => 0, // Default value for views_count
                ];
            }, $articles);

            // Prepare paginated response
            $paginatedData = [
                'data' => $formattedArticles,
                'current_page' => (int)$page,
                'last_page' => max(1, (int)ceil($totalResults / $limit)),
                'per_page' => (int)$limit,
                'total' => (int)$totalResults,
            ];

            Log::info('Final paginated data prepared successfully', ['dataCount' => count($formattedArticles)]);

        } catch (\Exception $e) {
            Log::error('Error in fetchNews', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            $paginatedData['error'] = 'An error occurred: ' . $e->getMessage();
            // Return the error response
            return Inertia::render('DiscordNews/Admin/Index', [
                'news' => $paginatedData
            ]);
        }
        
        // Return the successful response
        return Inertia::render('DiscordNews/Admin/Index', [
            'news' => $paginatedData,
        ]);
        
    }

    /**
     * Handle bulk actions for Discord news
     */
    public function bulkAction(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'action' => 'required|in:feature,unfeature,delete',
            'ids' => 'required|array|min:1'
        ]);
        
        $action = $validated['action'];
        $ids = $validated['ids'];
        $count = 0;

        // Since these are external API articles, we can't actually modify them in a database
        // Instead, we'll simulate the bulk action by logging it
        Log::info("Bulk action performed on Discord news", [
            'action' => $action,
            'ids' => $ids,
            'count' => count($ids)
        ]);

        // For now, we'll just return a success message since we can't actually
        // perform database operations on external API data
        return redirect()->route('admin.discord.news')
            ->with('success', "Bulk {$action} completed successfully. {$count} items affected.");
    }


    public function fetchDiscordMessages($limit = 50, $page = 1)
    {
        try {
            // Налаштування
            $botToken = env('DISCORD_BOT_TOKEN');
            if (!$botToken) {
                Log::error('DISCORD_BOT_TOKEN not set in .env');
                return Inertia::render('News/Error', ['message' => 'Discord Bot Token is not configured']);
            }

            // Список каналів
            $channelIds = [
                '895740485140906054',
                '586252910506016798',
                '594138785558691840',
                '669406841830244375',
            ];

            $perPage = min($limit, 100); // Discord обмежує до 100 повідомлень за запит
            $allMessages = [];

            // Витягування повідомлень із кожного каналу
            foreach ($channelIds as $channelId) {
                $baseUrl = "https://discord.com/api/v10/channels/{$channelId}/messages";
                $before = null;

                // Пагінація: обчислення параметра `before`
                if ($page > 1) {
                    $offset = ($page - 1) * $perPage;
                    $previousResponse = Http::withHeaders([
                        'Authorization' => "Bot {$botToken}",
                        'User-Agent' => 'DiscordNewsBot/1.0',
                    ])->get($baseUrl, ['limit' => $perPage]);

                    if ($previousResponse->successful() && !empty($previousResponse->json())) {
                        $messages = $previousResponse->json();
                        for ($i = 1; $i < $page; $i++) {
                            $lastMessage = end($messages);
                            $before = $lastMessage['id'] ?? null;
                            if ($before) {
                                $previousResponse = Http::withHeaders([
                                    'Authorization' => "Bot {$botToken}",
                                    'User-Agent' => 'DiscordNewsBot/1.0',
                                ])->get($baseUrl, ['limit' => $perPage, 'before' => $before]);
                                $messages = $previousResponse->successful() ? $previousResponse->json() : [];
                            }
                        }
                    }
                }

                // Запит до API
                $response = Http::withHeaders([
                    'Authorization' => "Bot {$botToken}",
                    'User-Agent' => 'DiscordNewsBot/1.0',
                ])->get($baseUrl, [
                    'limit' => $perPage,
                    'before' => $before,
                ]);

                if ($response->failed()) {
                    Log::error('Discord API request failed for channel', [
                        'channel_id' => $channelId,
                        'status' => $response->status(),
                        'response' => $response->body(),
                    ]);
                    continue; // Пропустити канал, якщо запит не вдався
                }

                $messages = $response->json();
                if (!empty($messages)) {
                    $allMessages = array_merge($allMessages, $messages);
                }
            }

            if (empty($allMessages)) {
                return Inertia::render('News/Error', ['message' => 'No messages found in any of the channels']);
            }

            // Сортування повідомлень за датою (timestamp)
            usort($allMessages, function ($a, $b) {
                return strtotime($b['timestamp']) - strtotime($a['timestamp']);
            });

            // Форматування повідомлень
            $formattedMessages = array_map(function ($message) {
                return [
                    'title' => $message['content'] ? mb_substr(mb_convert_encoding($message['content'], 'UTF-8', 'UTF-8'), 0, 100) . (mb_strlen($message['content']) > 100 ? '...' : '') : 'No content',
                    'url' => !empty($message['attachments']) ? mb_convert_encoding($message['attachments'][0]['url'] ?? '', 'UTF-8', 'UTF-8') : '',
                    'description' => mb_convert_encoding($message['content'] ?? 'No description', 'UTF-8', 'UTF-8'),
                    'source' => mb_convert_encoding($message['author']['username'] ?? 'Unknown author', 'UTF-8', 'UTF-8'),
                    'published_at' => $message['timestamp'] ?? now()->toIso8601String(),
                ];
            }, $allMessages);

            // Пагінація
            $totalResults = count($allMessages); // Приблизно, можна уточнити
            $paginatedData = [
                'data' => array_slice($formattedMessages, ($page - 1) * $perPage, $perPage),
                'current_page' => (int)$page,
                'last_page' => (int)ceil($totalResults / $perPage),
                'per_page' => (int)$perPage,
                'total' => (int)$totalResults,
            ];

            // Повернення через Inertia
            return Inertia::render('News/Index', $paginatedData);

        } catch (\Exception $e) {
            Log::error('Error in fetchDiscordMessages', ['message' => $e->getMessage()]);
            return Inertia::render('News/Error', [
                'message' => 'An error occurred: ' . $e->getMessage(),
            ], 500);
        }
    }
}