<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use HeadlessChromium\BrowserFactory;
use App\Models\Validator;

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
        //
        // Ваша логика задачи здесь
        \Log::info('Task executed at: ' . now());
        $this->info('Start making screenshot');
        $browserFactory = new BrowserFactory();

        // starts headless Chrome

//        $validators = Validators::whereNotNull('www_url')
//            ->where('www_url', '!=', '')->orderBy('id')
//            ->get();
//        $validators = Validator::orderBy('id')
//            ->limit(10)->get();
//        $validators = DB::table('data.validators')
//            ->whereNotNull('url')
//            ->where('url', '!=', '')
//            ->where('has_screenshot', false)
//            ->orderBy('id')
//            ->limit(15)
//            ->get();
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
                ->where('has_screenshot', false)
                ->where('url', '!=', '')
                ->orderBy('id')
                ->limit(15)
                ->get();
//            dd($validators);exit;

            foreach ($validators as $validator) {
                try {
                    $page = $browser->createPage();

                    // не чекаємо navigation, просто sleep
                    $page->navigate($validator->url);
                    usleep(3 * 1000000); // 3 сек

                    $filePath = storage_path("app/public/site-screenshots/{$validator->id}.png");
                    $page->screenshot()->saveToFile($filePath);
                    DB::statement("UPDATE data.validators SET has_screenshot = true WHERE id = {$validator->id}");

                    $this->info("✅ Screenshot created for validator {$validator->id}");
                } catch (\Throwable $e) {
                    \Log::error("❌ Screenshot failed for ID {$validator->id}: " . $e->getMessage());
                }
            }
        } finally {
            $browser->close(); // закриваємо в самому кінці
        }
//        foreach ($validators as $validator) {
////            dd($validator->www_url);exit;
//            // creates a new page and navigate to an URL
////            $page = $browser->createPage();
////            $page->navigate($validator->www_url)->waitForNavigation();
//            try {
////                $browser = $browserFactory->createBrowser([
////                    'windowSize'   => [1280, 800],
////                    'enableImages' => true,
////                    'headless'     => true,
////                    'ignoreHttpsErrors' => true, // Игнорировать ошибки HTTPS
////                    'timeout'      => 30000, // Таймаут 30 секунд
////                ]);
//                $page = $browser->createPage();
//                $page->navigate($validator->url);
////                usleep(3 * 1000000); // дати сторінці прогрузитись
//
//                // Дочекатися 5 секунд для завантаження асинхронного контенту
////                sleep(3);
//
//                // Отримати заголовок сторінки
//                $pageTitle = $page->evaluate('document.title')->getReturnValue();
//
//                // Зробити скріншот
//                $page->screenshot()->saveToFile(storage_path('app/public/site-screenshots/' . $validator->id . '.png'));
//
//                // Зберегти PDF
////                $page->pdf(['printBackground' => false])->saveToFile(storage_path('app/public/site-screenshots/' . $validator->id . '.pdf'));
//
//                echo "Create screenshot for validator " . $validator->id . "\n";
//            } finally {
//                $browser->close();
//            }
//        }
    }
}