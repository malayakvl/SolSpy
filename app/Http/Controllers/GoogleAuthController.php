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
            // Get the user information from Google
            $user = Socialite::driver('google')->user();
        } catch (Throwable $e) {
            return redirect('/')->with('error', 'Google authentication failed.');
        }
dd($user);exit;
        // Check if the user already exists in the database
        $existingUser = User::where('email', $user->email)->first();
        if ($existingUser) {
            // Log the user in if they already exist
            Auth::login($existingUser);
        } else {
            // Otherwise, create a new user and log them in
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

            $newUser->assignRole('User');
            Auth::login($newUser);
        }

        // Redirect the user to the dashboard or any other secure page
        return redirect('/dashboard');
    }
}
