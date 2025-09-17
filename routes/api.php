<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\Api\ValidatorController as ApiValidatorController;

Route::get('/fetch-settings', [SettingsController::class, 'getDataWithHeader'])->name('settings.get');
Route::get('/fetch-by-id-validators/{page?}', [ApiValidatorController::class, 'fetchByIds'])->name('validators.fetchByIds');

// Session-based authentication for SPA API calls (this is what you need for authenticated users)
Route::middleware(['web', 'auth'])->group(function () {
    Route::get('/fetch-validators', [ApiValidatorController::class, 'timeoutData'])->name('validators.timeoutData');
    Route::get('/validator-metrics', [ApiValidatorController::class, 'getValidatorMetrics'])->name('validators.metrics');
    Route::get('/historical-metrics', [ApiValidatorController::class, 'getHistoricalMetrics'])->name('validators.historicalMetrics');
    Route::post('/add-compare', [ApiValidatorController::class, 'addCompare'])->name('api.validators.addCompare');
    Route::post('/add-favorite', [ApiValidatorController::class, 'addFavorite'])->name('api.validators.addFavorite');
    Route::post('/ban-validator', [ApiValidatorController::class, 'banValidator'])->name('api.validators.banValidator');
    Route::post('/mark-validators', [ApiValidatorController::class, 'markValidators'])->name('api.validators.markValidator');
    Route::post('/settings/update', [SettingsController::class, 'update'])->name('settings.update');

    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Remove the conflicting routes that don't have proper authentication