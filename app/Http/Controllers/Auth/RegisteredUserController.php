<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\ValidatorDataService;

class RegisteredUserController extends Controller
{
    protected $validatorDataService;

    public function __construct(ValidatorDataService $validatorDataService)
    {
        $this->validatorDataService = $validatorDataService;
    }

    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'validatorCompare' => ['array'],
            'validatorCompare.*' => ['integer'],
            'validatorFavorites' => ['array'],
            'validatorFavorites.*' => ['integer'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Assign the 'Customer' role to the newly registered user
        $user->assignRole('Customer');

        event(new Registered($user));

        Auth::login($user);
        
        $userId = $user->id;

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

        return redirect(route('dashboard', absolute: false));
    }
}