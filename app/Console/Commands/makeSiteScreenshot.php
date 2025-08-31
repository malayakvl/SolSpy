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
        $validators = Validator::where('id', '=', 47)->orderBy('id')
            ->get();
        foreach ($validators as $validator) {
//            dd($validator->www_url);exit;
            // creates a new page and navigate to an URL
//            $page = $browser->createPage();
//            $page->navigate($validator->www_url)->waitForNavigation();
            try {
                $browser = $browserFactory->createBrowser([
                    'windowSize'   => [1280, 800],
                    'enableImages' => true,
                ]);
                $page = $browser->createPage();
                $page->navigate($validator->www_url)->waitForNavigation();

                // Дочекатися 5 секунд для завантаження асинхронного контенту
                sleep(3);

                // Отримати заголовок сторінки
                $pageTitle = $page->evaluate('document.title')->getReturnValue();

                // Зробити скріншот
                $page->screenshot()->saveToFile(storage_path('app/public/site-screenshots/' . $validator->id . '.png'));

                // Зберегти PDF
//                $page->pdf(['printBackground' => false])->saveToFile(storage_path('app/public/site-screenshots/' . $validator->id . '.pdf'));

                echo "Create screenshot for validator " . $validator->id . "\n";
            } finally {
                $browser->close();
            }


//            try {
//                $browser = $browserFactory->createBrowser();
//                // creates a new page and navigate to an URL
//                $page = $browser->createPage();
//                $page->navigate($validator->www_url)->waitForNavigation();
//
//                // get page title
//                $pageTitle = $page->evaluate('document.title')->getReturnValue();
//
//                // screenshot - Say "Cheese"! 😄
//                $page->screenshot()->saveToFile('/Users/viktoriakorogod/WEB/SolSpy/storage/app/public/site-screenshots/' .$validator->id. '.png');
//
//                // pdf
//                $page->pdf(['printBackground' => false])->saveToFile('/Users/viktoriakorogod/WEB/SolSpy/storage/app/public/site-screenshots/' .$validator->id. '.pdf');
//                echo "Create screenshot for validator ".$validator->id."\n";
//                exit;
//            } finally {
//                // bye
//                $browser->close();
//            }
        }
    }
}