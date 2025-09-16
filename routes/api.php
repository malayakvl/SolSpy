<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\Api\ValidatorController as ApiValidatorController;

Route::get('/fetch-settings', [SettingsController::class, 'getDataWithHeader'])->name('settings.get');
Route::get('/fetch-by-id-validators/{page?}', [ApiValidatorController::class, 'fetchByIds'])->name('validators.fetchByIds');

//Route::middleware('auth:sanctum')->get('/add-compare', [ValidatorController::class, 'addToCompareAuth']);

Route::middleware('api')->group(function () {
    Route::get('/fetch-validators', [ApiValidatorController::class, 'timeoutData'])->name('validators.timeoutData');
    Route::get('/fetch-settings', [SettingsController::class, 'getDataWithHeader'])->name('settings.get');
    Route::get('/validator-metrics', [ApiValidatorController::class, 'getValidatorMetrics'])->name('validators.metrics');
    Route::get('/historical-metrics', [ApiValidatorController::class, 'getHistoricalMetrics'])->name('validators.historicalMetrics');
    Route::post('/settings/update', [SettingsController::class, 'update'])->name('settings.update');

    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::post('/add-compare', [ApiValidatorController::class, 'addCompare'])->name('api.validators.addCompare');
    Route::post('/add-favorite', [ApiValidatorController::class, 'addFavorite'])->name('api.validators.addFavorite');
    Route::post('/mark-validators', [ApiValidatorController::class, 'markValidators'])->name('api.validators.markValidator');

});

// Session-based authentication for SPA API calls
Route::middleware(['web', 'auth'])->group(function () {
    Route::post('/api/add-compare', [ApiValidatorController::class, 'addCompare'])->name('api.validators.addCompare');
    Route::post('/api/add-favorite', [ApiValidatorController::class, 'addFavorite'])->name('api.validators.addFavorite');
    Route::post('/api/ban-validator', [ApiValidatorController::class, 'banValidator'])->name('api.validators.banValidator');
});