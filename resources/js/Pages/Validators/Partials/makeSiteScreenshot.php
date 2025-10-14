<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use HeadlessChromium\BrowserFactory;
use App\Models\Validator;
use Exception;

class makeSiteScreenshot extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:makes-site-screenshot';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch Validators';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Log task execution
        Log::info('Screenshot task executed at: ' . now());
        $this->info('Start making screenshot');
        
        $browserFactory = new BrowserFactory();

        // starts headless Chrome
        $browser = $browserFactory->createBrowser([
            'windowSize'   => [1280, 800],
            'enableImages' => true,
            'headless'     => true,
            'ignoreHttpsErrors' => true, // Игнорировать ошибки HTTPS
            'timeout'      => 30000, // Таймаут 30 секунд
        ]);
        try {
            $validators = DB::table('data.validators')
                ->select('url', 'id')
                ->whereNotNull('url')
                ->where(function($query) {
                    $query->where('has_screenshot', false)
                          ->orWhereNull('has_screenshot');
                })
                ->where('url', '!=', '')
                ->where('id', '>=', 19566)
                ->orderBy('id')
                ->limit(15)
                ->get();
            
            $this->info("Found {$validators->count()} validators to process");
            
            if ($validators->isEmpty()) {
                $this->info('No validators found without screenshots');
                return;
            }

            foreach ($validators as $validator) {
                try {
                    $page = $browser->createPage();

                    // не чекаємо navigation, просто sleep
                    $page->navigate($validator->url);
                    usleep(3 * 1000000); // 3 сек

                    // Ensure the directory exists
                    $screenshotDir = storage_path('app/public/site-screenshots');
                    if (!file_exists($screenshotDir)) {
                        mkdir($screenshotDir, 0755, true);
                    }
                    
                    $filePath = $screenshotDir . "/{$validator->id}.png";
                    $this->info("Saving screenshot to: {$filePath}");
                    
                    $page->screenshot()->saveToFile($filePath);
                    DB::statement("UPDATE data.validators SET has_screenshot = true WHERE id = {$validator->id}");

                    $this->info("✅ Screenshot created for validator {$validator->id}");
                } catch (Exception $e) {
                    Log::error("❌ Screenshot failed for ID {$validator->id}: " . $e->getMessage());
                    $this->error("❌ Screenshot failed for validator {$validator->id}");
                }
            }
        } catch (Exception $e) {
            Log::error('Browser creation or screenshot process failed: ' . $e->getMessage());
            $this->error('Screenshot process failed: ' . $e->getMessage());
        } finally {
            if (isset($browser)) {
                $browser->close();
            }
        }
        $this->info('Screenshot task completed successfully.');
    }
}