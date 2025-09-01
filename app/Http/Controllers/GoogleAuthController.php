<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Throwable;
class GoogleAuthController extends Controller
{
    //
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle the callback from Google.
     */
    public function callback()
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
        }

        // Redirect the Users to the dashboard or any other secure page
        return redirect('/dashboard');
    }
}
