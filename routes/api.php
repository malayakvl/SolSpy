<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\Api\ValidatorController as ApiValidatorController;
use App\Http\Controllers\ValidatorOrderController;
use App\Http\Controllers\DiscordNewsController;
use App\Http\Controllers\NewsController;

Route::get('/fetch-settings', [SettingsController::class, 'getDataWithHeader'])->name('settings.get');
Route::get('/fetch-by-id-validators/{page?}', [ApiValidatorController::class, 'fetchByIds'])->name('validators.fetchByIds');

// Public API routes - accessible to everyone
Route::get('/fetch-validators', [ApiValidatorController::class, 'timeoutData'])->name('validators.timeoutData');
Route::get('/fetch-favorite-validators', [ApiValidatorController::class, 'timeoutFavoriteData'])->name('validators.timeoutFavoriteData');
Route::get('/fetch-favorite-validators-public', [ApiValidatorController::class, 'publicFavoriteData'])->name('validators.publicFavoriteData');
Route::get('/fetch-comparison-validators-public', [ApiValidatorController::class, 'publicComparisonData'])->name('validators.publicComparisonData');
Route::get('/fetch-score', [ApiValidatorController::class, 'getValidatorScore'])->name('validators.getValidatorScore');

// Session-based authentication for SPA API calls (this is what you need for authenticated users)
Route::middleware(['web', 'auth'])->group(function () {
    Route::get('/fetch-validators-auth', [ApiValidatorController::class, 'timeoutData'])->name('validators.timeoutDataAuth');
    Route::get('/fetch-blocke-validators', [ApiValidatorController::class, 'timeoutBlockedData'])->name('validators.timeoutBlockedData');
    Route::get('/fetch-favorite-validators', [ApiValidatorController::class, 'timeoutFavoriteData'])->name('validators.timeoutFavoriteData');
    Route::get('/fetch-comparison-validators', [ApiValidatorController::class, 'timeoutComparisonData'])->name('validators.timeoutComparisonData');
    Route::get('/remove-comparison-validators', [ApiValidatorController::class, 'removeComparisons'])->name('validators.removeComparisons');
    Route::get('/validator-metrics', [ApiValidatorController::class, 'getValidatorMetrics'])->name('validators.metrics');
    Route::get('/historical-metrics', [ApiValidatorController::class, 'getHistoricalMetrics'])->name('validators.historicalMetrics');
    Route::post('/add-compare', [ApiValidatorController::class, 'addCompare'])->name('api.validators.addCompare');
    Route::post('/add-favorite', [ApiValidatorController::class, 'addFavorite'])->name('api.validators.addFavorite');
    Route::post('/ban-validator', [ApiValidatorController::class, 'banValidator'])->name('api.validators.banValidator');
    Route::post('/mark-validators', [ApiValidatorController::class, 'markValidators'])->name('api.validators.markValidator');
    Route::post('/settings/update', [SettingsController::class, 'update'])->name('settings.update');

    // Validator order routes
    Route::post('/validator-order/update', [ValidatorOrderController::class, 'updateOrder'])->name('validator-order.update');
    Route::get('/validator-order/{listType?}', [ValidatorOrderController::class, 'getOrder'])->name('validator-order.get');

    // Discord news routes
    Route::get('/discord-news', [DiscordNewsController::class, 'index'])->name('discord-news.index');
    Route::post('/discord-news', [DiscordNewsController::class, 'store'])->name('discord-news.store');
    Route::get('/discord-news/{discordNews}', [DiscordNewsController::class, 'show'])->name('discord-news.show');
    Route::put('/discord-news/{discordNews}', [DiscordNewsController::class, 'update'])->name('discord-news.update');
    Route::delete('/discord-news/{discordNews}', [DiscordNewsController::class, 'destroy'])->name('discord-news.destroy');
    Route::post('/discord-news-order/update', [DiscordNewsController::class, 'updateOrder'])->name('discord-news-order.update');
    Route::get('/discord-news-order', [DiscordNewsController::class, 'getOrder'])->name('discord-news-order.get');
    Route::post('/discord-news/top', [DiscordNewsController::class, 'toggleTop'])->name('discord-news.top');
    Route::get('/discord-news-top', [DiscordNewsController::class, 'getTop'])->name('discord-news.getTop');

    // Top news order routes
    Route::post('/top-news-order/update', [DiscordNewsController::class, 'updateTopNewsOrder'])->name('top-news-order.update');
    Route::get('/top-news-order', [DiscordNewsController::class, 'getTopNewsOrder'])->name('top-news-order.get');
    
    // Get top news in correct sort order
    Route::get('/top-news', [NewsController::class, 'getTopNews'])->name('top-news.get');

    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});