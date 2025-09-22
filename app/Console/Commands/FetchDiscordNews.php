<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\DiscordNews;
use Illuminate\Support\Facades\Log;

class FetchDiscordNews extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fetch-discord-news';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch Discord news from API and store in database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Fetching Discord news...');
        
        try {
            // For now, let's create some sample data since we don't have the actual API endpoint
            // You'll need to replace this with your actual Discord API integration
            
            // Sample news items
            $sampleNews = [
                [
                    'title' => 'New Feature Release',
                    'content' => 'We are excited to announce the release of our new feature that will enhance your experience.',
                    'url' => 'https://discord.com/news/new-feature',
                    'author' => 'Admin',
                    'published_at' => now()->subDays(1),
                    'image_url' => null,
                    'is_top' => true, // Set as top news
                ],
                [
                    'title' => 'System Maintenance',
                    'content' => 'Scheduled maintenance will occur this weekend. Please plan accordingly.',
                    'url' => 'https://discord.com/news/maintenance',
                    'author' => 'Admin',
                    'published_at' => now()->subDays(2),
                    'image_url' => null,
                    'is_top' => false,
                ],
                [
                    'title' => 'Community Update',
                    'content' => 'Our community has reached a new milestone. Thank you for your continued support!',
                    'url' => 'https://discord.com/news/community-update',
                    'author' => 'Community Manager',
                    'published_at' => now()->subDays(3),
                    'image_url' => null,
                    'is_top' => true, // Set as top news
                ],
            ];
            
            foreach ($sampleNews as $newsItem) {
                // Check if news item already exists to avoid duplicates
                $existingNews = DiscordNews::where('title', $newsItem['title'])
                    ->where('content', $newsItem['content'])
                    ->first();
                
                if (!$existingNews) {
                    DiscordNews::create($newsItem);
                    $this->info('Created news item: ' . $newsItem['title']);
                } else {
                    $this->info('News item already exists: ' . $newsItem['title']);
                }
            }
            
            $this->info('News items saved successfully');
            
        } catch (\Exception $e) {
            $this->error('Error fetching news: ' . $e->getMessage());
            Log::error('Error fetching Discord news', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
}