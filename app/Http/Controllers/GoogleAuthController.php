<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Throwable;
use App\Services\ValidatorDataService;

class GoogleAuthController extends Controller
{
    protected $validatorDataService;

    public function __construct(ValidatorDataService $validatorDataService)
    {
        $this->validatorDataService = $validatorDataService;
    }

    //
    public function redirect(Request $request)
    {
        // Store localStorage data in session before redirecting to Google
        $validatorCompare = $request->input('validatorCompare');
        $validatorFavorites = $request->input('validatorFavorites');
        
        if ($validatorCompare) {
            $request->session()->put('validatorCompare', $validatorCompare);
        }
        
        if ($validatorFavorites) {
            $request->session()->put('validatorFavorites', $validatorFavorites);
        }
        
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle the callback from Google.
     */
    public function callback(Request $request)
    {
        try {
            // Get the Users information from Google
            $user = Socialite::driver('google')->user();
        } catch (Throwable $e) {
            return redirect('/')->with('error', 'Google authentication failed.');
        }
        // Check if the Users already exists in the database
        $existingUser = User::where('email', $user->email)->first();
        if ($existingUser) {
            // Log the Users in if they already exist
            Auth::login($existingUser);
            $userId = $existingUser->id;
        } else {
            // Otherwise, create a new Users and log them in
            $newUser = User::updateOrCreate([
                'email' => $user->email,
                'avatar' => $user->avatar,
                'provider' => 'google'
            ], [
                'name' => $user->name,
                'password' => bcrypt(Str::random(16)), // Set a random password
                'email_verified_at' => now(),
                'avatar' => $user->avatar,
                'provider' => 'google'
            ]);
            $newUser->provider = 'google';
            $newUser->avatar = $user->avatar;
            $newUser->save();

            $newUser->assignRole('Users');
            Auth::login($newUser);
            $userId = $newUser->id;
        }

        // Migrate localStorage data to database
        // Get comparison data from session (set by frontend before redirecting to Google)
        $comparisonIds = session('validatorCompare', []);
        if (!empty($comparisonIds)) {
            $this->validatorDataService->migrateLocalStorageComparisonData($userId, $comparisonIds);
            // Clear the session data after migration
            $request->session()->forget('validatorCompare');
        }

        // Get favorite data from session (set by frontend before redirecting to Google)
        $favoriteIds = session('validatorFavorites', []);
        if (!empty($favoriteIds)) {
            $this->validatorDataService->migrateLocalStorageFavoriteData($userId, $favoriteIds);
            // Clear the session data after migration
            $request->session()->forget('validatorFavorites');
        }

        // Redirect the Users to the dashboard or any other secure page
        return redirect('/dashboard');
    }
}