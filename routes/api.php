<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingsController;

Route::get('/fetch-settings', [SettingsController::class, 'getDataWithHeader'])->name('settings.get');


Route::middleware('api')->group(function () {
    Route::get('/fetch-settings', [SettingsController::class, 'getDataWithHeader'])->name('settings.get');
    Route::get('/validators', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

