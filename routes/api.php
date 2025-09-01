<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\ValidatorController;

Route::get('/fetch-settings', [SettingsController::class, 'getDataWithHeader'])->name('settings.get');
//Route::middleware('auth:sanctum')->get('/add-compare', [ValidatorController::class, 'addToCompareAuth']);

Route::middleware('api')->group(function () {
    Route::get('/fetch-validators', [ValidatorController::class, 'timeoutData'])->name('validators.timeoutData');
    Route::get('/fetch-settings', [SettingsController::class, 'getDataWithHeader'])->name('settings.get');

    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

