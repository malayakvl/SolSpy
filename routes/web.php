<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\ValidatorController;

use Inertia\Inertia;

// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/comparisons/{page?}', [ValidatorController::class, 'comparisons'])->name('validators.comparisons');
Route::get('/favorites/{page?}', [ValidatorController::class, 'favorites'])->name('validators.favorites');

// Specific validator routes
Route::get('/validators/{page?}', [ValidatorController::class, 'index'])->name('validators.view');
//Route::get('/validator/{id}', [ValidatorController::class, 'view'])->name('validator.view');

// Route to redirect to Google's OAuth page
Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect'])->name('auth.google.redirect');

// Route to handle the callback from Google
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->name('auth.google.callback');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/customers', [ProfileController::class, 'edit'])->name('customers.view');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/add-compare', [ValidatorController::class, 'addCompare'])->name('validators.addCompare');
});

require __DIR__.'/auth.php';

// Home page route - MUST be last to avoid catching other routes
Route::get('/{page?}', [ValidatorController::class, 'index'])->name('home');
