<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class ProfileController extends Controller
{
    public function index(Request $request): Response {
        // dd($request->user()->hasRole('Manager'));exit;

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
        // $request->user()->load('roles');
        // dd($request->user()->hasRole('Admin'));
    }

    /**
     * Display the Users's profile form.
     */
    public function edit(Request $request): Response
    {
//        dd(1);
        $user = $request->user();
//        $role = Role::where('name', 'Admin')->first();
//        $permission = Permission::where('name', 'customer-all')->first();
//        $permission->assignRole($role);
//        $permission = Permission::where('name', 'customer-create')->first();
//        $permission->assignRole($role);
//        $permission = Permission::where('name', 'customer-edit')->first();
//        $permission->assignRole($role);
//        $permission = Permission::where('name', 'customer-delete')->first();
//        $permission->assignRole($role);
//        dd($Users->getAllPermissions());
//        exit;

//        dd($Users->getAllPermissions());
//        dd($Users->hasRole('Admin'));
//        $Users->assignRole('Admin');
//        dd($Users->hasRole('Admin'));
//        dd($request->getUser());exit;
//        $permission = Permission::create(['name' => 'customer-all']);
//        $permission = Permission::create(['name' => 'customer-create']);
//        $permission = Permission::create(['name' => 'customer-edit']);
//        $permission = Permission::create(['name' => 'customer-delete']);
//        exit;

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the Users's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the Users's account.
     */
    public function destroy(Request $request)
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Use Inertia::location to force a full page refresh
        // This ensures the CSRF token is refreshed
        return Inertia::location(url('/'));
    }
}