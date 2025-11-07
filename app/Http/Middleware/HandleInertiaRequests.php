<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        
        // If user is authenticated, load the telegram links relationship
        if ($user) {
            $user->load('telegramLinks');
        }
        
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user,
                'role' => $user?->getRoleNames(),
                'can' => $user?->getAllPermissions()->mapWithKeys(function ($permission) {
                    return [$permission->name => true];
                })->all()
            ]
        ]);
    }
}