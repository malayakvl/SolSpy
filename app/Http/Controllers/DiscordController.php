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
                    'title' => $message['content'] ? substr($message['content'], 0, 100) . (strlen($message['content']) > 100 ? '...' : '') : 'No content',
                    'url' => !empty($message['attachments']) ? ($message['attachments'][0]['url'] ?? '') : '',
                    'description' => $message['content'] ?? 'No description',
                    'source' => $message['author']['username'] ?? 'Unknown author',
                    'published_at' => $message['timestamp'] ?? now()->toIso8601String(),
                ];
            }, $allMessages);

            // Пагінація
            $totalResults = count($allMessages); // Приблизно, можна уточнити
            $paginatedData = [
                'data' => array_slice($formattedMessages, ($page - 1) * $perPage, $perPage),
                'current_page' => $page,
                'last_page' => ceil($totalResults / $perPage),
                'per_page' => $perPage,
                'total' => $totalResults,
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