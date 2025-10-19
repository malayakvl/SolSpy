<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\ValidatorDataService;
use App\Services\TotalStakeService;
use App\Services\SpyRankService;
use App\Models\Settings;


class DashboardController extends Controller
{
    protected $validatorDataService;
    protected $totalStakeService;
    protected $spyRankService;

    public function __construct(
        ValidatorDataService $validatorDataService,
        TotalStakeService $totalStakeService,
        SpyRankService $spyRankService
    ) {
        $this->validatorDataService = $validatorDataService;
        $this->totalStakeService = $totalStakeService;
        $this->spyRankService = $spyRankService;
    }

    /**
     * Display the appropriate dashboard based on user role.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        if ($user->hasRole('Customer')) {
            return redirect()->route('dashboard.customer');
        } elseif ($user->hasRole('Manager')) {
            return redirect()->route('dashboard.manager');
        } elseif ($user->hasRole(['Admin'])) {
            return redirect()->route('admin.validators.index');
        }

        
        // Default redirect for authenticated users without specific roles
        return redirect()->route('dashboard.customer');
    }

    function indexCustomer(Request $request)
    {
        // fetch favorites validators
        $limit = 10;
        $page = max(1, (int) $request->get('page', 1));
        $offset = ($page - 1) * $limit;
        $filterType = $request->get('filterType', 'all');
        $userId = $request->user() ? $request->user()->id : null;
        
        // For unauthenticated users, get favorite validator IDs from request parameter
        $favoriteIds = null;
        if (!$userId) {
            $favoriteIds = $request->get('validatorFavorites', []); // Get from localStorage parameter
            if (is_string($favoriteIds)) {
                $favoriteIds = json_decode($favoriteIds, true) ?: [];
            }
        }

        // Get total stake data
        $stakeData = $this->totalStakeService->getTotalStake();
        $totalStakeLamports = $stakeData[0]->total_network_stake_sol * 1000000000;
        // Fetch favorites data using service
        $validatorsFavorites = $this->validatorDataService->fetchDataFavoriteValidators($userId, $filterType, $offset, $totalStakeLamports, $favoriteIds);
        $favoritesTotalCount = $validatorsFavorites['totalFilteredValidators'];
        // Fetch blocked data using service
        $validatorsBlocked = $this->validatorDataService->fetchDataBlockedValidators($userId, $filterType, $offset, $totalStakeLamports, $favoriteIds);
        $blockedTotalCount = $validatorsBlocked['totalFilteredValidators'];
        
        return Inertia::render('Dashboard/Customer/Index', [
            'favoriteValidators' => $validatorsFavorites['results'],
            'favoritesTotalCount' => $favoritesTotalCount,
            'blockedValidators' => $validatorsBlocked['results'],
            'blockedTotalCount' => $blockedTotalCount,
            'settingsData' => Settings::first(),
            'currentPage' => $page,
            'filterType' => $filterType,
            'totalStakeData' => $stakeData[0],
        ]);
    }
}