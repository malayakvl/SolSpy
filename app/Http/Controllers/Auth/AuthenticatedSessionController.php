<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\ValidatorDataService;

class AuthenticatedSessionController extends Controller
{
    protected $validatorDataService;

    public function __construct(ValidatorDataService $validatorDataService)
    {
        $this->validatorDataService = $validatorDataService;
    }

    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $userId = Auth::id();

        // Migrate localStorage data to database
        // Get comparison data from request
        $comparisonIds = $request->input('validatorCompare', []);
        if (!empty($comparisonIds)) {
            $this->validatorDataService->migrateLocalStorageComparisonData($userId, $comparisonIds);
        }

        // Get favorite data from request
        $favoriteIds = $request->input('validatorFavorites', []);
        if (!empty($favoriteIds)) {
            $this->validatorDataService->migrateLocalStorageFavoriteData($userId, $favoriteIds);
        }

        // Get favorite data from request
        $blockedIds = $request->input('validatorBlocked', []);
        if (!empty($blockedIds)) {
            $this->validatorDataService->migrateLocalStorageBlockedData($userId, $blockedIds);
        }

        // Check if the user has the Customer role and redirect accordingly
        $user = Auth::user();
        if ($user && $user->hasRole('Customer')) {
            return redirect()->intended(route('validators.view', absolute: false));
        }

        return redirect()->intended(route('validators.view', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}