<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\ValidatorController;
use App\Http\Controllers\Api\ValidatorController as ApiValidatorController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\DiscordController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DashboardController;

use Inertia\Inertia;

use Illuminate\Support\Facades\Http;
use App\Models\TelegramLink;

Route::get('/test-telegram', function () {
    $token = env('TELEGRAM_BOT_TOKEN');

    $links = TelegramLink::whereNotNull('chat_id')->get();

    foreach ($links as $link) {
        Http::post("https://api.telegram.org/bot{$token}/sendMessage", [
            'chat_id' => $link->chat_id,
            'text' => "💋🌹Test message from SolSpy! Everything works!"
        ]);
    }

    return "OK";
});


// Dashboard route - redirect based on user role
Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

// Customer dashboard route
Route::get('/dashboard/customer', [DashboardController::class, 'indexCustomer'])->middleware(['auth', 'verified'])->name('dashboard.customer');

// Manager dashboard route
Route::get('/dashboard/manager', function () {
    return Inertia::render('Dashboard/Manager/Index');
})->middleware(['auth', 'verified'])->name('dashboard.manager');

Route::get('/comparisons/{page?}', [ValidatorController::class, 'comparisons'])->name('validators.comparisons');
Route::get('/favorites/{page?}', [ValidatorController::class, 'favorites'])->name('validators.favorites');
// 
Route::get('/sortable', [ValidatorController::class, 'sortable'])->name('validators.sortable');

// Specific validator routes
Route::get('/validators/{page?}', [ValidatorController::class, 'index'])->name('validators.view');
Route::get('/validator/{voteKey}', [ValidatorController::class, 'view'])->name('validator.view');

// Route to redirect to Google's OAuth page
Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect'])->name('auth.google.redirect');

// Route to handle the callback from Google
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->name('auth.google.callback');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Route::get('/customers', [ProfileController::class, 'edit'])->name('customers.view');
    // Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    // Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/add-compare', [ValidatorController::class, 'addCompare'])->name('validators.addCompare');
});

// News routes - public access
Route::get('/news', [NewsController::class, 'index'])->name('news.index');
Route::get('/news/featured', [NewsController::class, 'featured'])->name('news.featured');
Route::get('/news/{slug}', [NewsController::class, 'show'])->name('news.show');

// Admin news routes - protected
Route::middleware(['auth', 'check.role:Admin,Manager'])->prefix('admin')->group(function () {
    Route::get('/discord-news', [DiscordController::class, 'adminIndex'])->name('admin.discord.news');
    Route::get('/sort-top-news', [NewsController::class, 'sortTopNews'])->name('admin.sort-top-news');
    Route::post('/discord-news/bulk-action', [DiscordController::class, 'bulkAction'])->name('admin.discord.bulk-action');
    Route::get('/news', [NewsController::class, 'adminIndex'])->name('admin.news.index');
    Route::get('/news/create', [NewsController::class, 'create'])->name('admin.news.create');
    Route::post('/news', [NewsController::class, 'store'])->name('admin.news.store');
    Route::get('/news/{news}/edit', [NewsController::class, 'edit'])->name('admin.news.edit');
    Route::put('/news/{news}', [NewsController::class, 'update'])->name('admin.news.update');
    Route::delete('/news/{news}', [NewsController::class, 'destroy'])->name('admin.news.destroy');
    Route::post('/news/bulk-action', [NewsController::class, 'bulkAction'])->name('admin.news.bulk-action');
    Route::get('/settings', [SettingsController::class, 'adminIndex'])->name('admin.settings.index');
    Route::put('/settings', [SettingsController::class, 'updateDataSettings'])->name('admin.settings.update');
    
    // Admin validators routes
    Route::get('/validators', [ValidatorController::class, 'adminIndex'])->name('admin.validators.index');
    Route::get('/validators/top', [ValidatorController::class, 'adminTopIndex'])->name('admin.validators.top');
    Route::post('/validators/bulk-action', [ValidatorController::class, 'bulkAction'])->name('admin.validators.bulk-action');
    
    // Admin customers routes
    Route::get('/customers', [UserController::class, 'index'])->name('admin.customers.index');
});

// API routes for news utilities
Route::post('/api/news/generate-slug', [NewsController::class, 'generateSlug'])->name('api.news.generateSlug');

// API route for validator average rank
Route::get('/api/validators/average-rank', [ValidatorController::class, 'getAverageRank'])->name('api.validators.average-rank');

// Home page route - MUST be last to avoid catching other routes
require __DIR__.'/auth.php';
Route::get('/{page?}', [ValidatorController::class, 'index'])->name('home');