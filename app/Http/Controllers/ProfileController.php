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

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
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
//        dd($user->getAllPermissions());
//        exit;

//        dd($user->getAllPermissions());
//        dd($user->hasRole('Admin'));
//        $user->assignRole('Admin');
//        dd($user->hasRole('Admin'));
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
     * Update the user's profile information.
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
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
