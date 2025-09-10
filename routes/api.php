<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\ValidatorController;

Route::get('/fetch-settings', [SettingsController::class, 'getDataWithHeader'])->name('settings.get');
Route::get('/fetch-by-id-validators/{page?}', [ValidatorController::class, 'fetchByIds'])->name('validators.fetchByIds');

//Route::middleware('auth:sanctum')->get('/add-compare', [ValidatorController::class, 'addToCompareAuth']);

Route::middleware('api')->group(function () {
    Route::get('/fetch-validators', [ValidatorController::class, 'timeoutData'])->name('validators.timeoutData');
    Route::get('/fetch-settings', [SettingsController::class, 'getDataWithHeader'])->name('settings.get');
    Route::post('/settings/update', [SettingsController::class, 'update'])->name('settings.update');

    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Session-based authentication for SPA API calls
Route::middleware(['web', 'auth'])->group(function () {
    Route::post('/api/add-compare', [ValidatorController::class, 'addCompare'])->name('api.validators.addCompare');
    Route::post('/api/add-favorite', [ValidatorController::class, 'addFavorite'])->name('api.validators.addFavorite');
    Route::post('/api/ban-validator', [ValidatorController::class, 'banValidator'])->name('api.validators.banValidator');
});

