<?php

namespace App\Http\Controllers;

use App\Models\Favorits;
use App\Models\Settings;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\SpyRankService;
use App\Services\TotalStakeService;
use App\Services\ValidatorDataService;

class ValidatorController extends Controller
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

    public function index(Request $request): Response
    {
        $limit = 10;
        $page = max(1, (int) $request->get('page', 1));
        $offset = ($page - 1) * $limit;
        $filterType = $request->get('filterType', 'all');
        $userId = $request->user() ? $request->user()->id : null;
        
        // Get total stake data
        $stakeData = $this->totalStakeService->getTotalStake();
        $totalStakeLamports = $stakeData[0]->total_network_stake_sol * 1000000000;

        // Fetch validators data using service
        $validators = $this->validatorDataService->fetchDataValidators($userId ?? null, $filterType, $offset, $totalStakeLamports);
        $sortedValidators = $validators['validatorsAllData']->toArray();
        $filteredTotalCount = $validators['totalFilteredValidators'];

        // Get top validators
        $topValidatorsWithRanks = $this->validatorDataService->fetchDataTopValidators($sortedValidators, $totalStakeLamports);

        if (!$request->user()) {
            return Inertia::render('Validators/Index', [
                'validatorsData' => $validators['results'],
                'settingsData' => Settings::first(),
                'totalCount' => $filteredTotalCount,
                'currentPage' => $page,
                'filterType' => $filterType,
                'totalStakeData' => $stakeData[0],
                'topValidatorsData' => $topValidatorsWithRanks
            ]);
        } else {
            return Inertia::render('Validators/Admin/Index', [
                'validatorsData' => $validators['results'],
                'settingsData' => Settings::first(),
                'totalCount' => $filteredTotalCount,
                'currentPage' => $page,
                'filterType' => $filterType,
                'totalStakeData' => $stakeData[0],
                'topValidatorsData' => $topValidatorsWithRanks
            ]);
        }
    }

    public function timeoutData(Request $request)
    {
        $page = max(1, (int) $request->get('page', 1));
        $limit = 10;
        $offset = ($page - 1) * $limit;
        $filterType = $request->get('filterType', 'all');
        $searchTerm = $request->get('search', '');
        $sortColumn = $request->get('sortColumn', 'id');
        $sortDirection = $request->get('sortDirection', 'ASC');
        $userId = $request->user() ? $request->user()->id : null;
        // Get total stake data
        $stakeData = $this->totalStakeService->getTotalStake();
        $totalStakeLamports = $stakeData[0]->total_network_stake_sol * 1000000000;

        // Fetch timeout data using service
        $data = $this->validatorDataService->timeoutData(
            $sortColumn, 
            $sortDirection, 
            $totalStakeLamports,
            $userId, 
            $filterType, 
            $limit, 
            $offset, 
            $searchTerm
        );

        return response()->json([
            'validatorsData' => $data['validatorsData'],
            'settingsData' => Settings::first(),
            'totalCount' => $data['filteredTotalCount'],
            'currentPage' => $page,
            'filterType' => $filterType,
            'totalStakeData' => $stakeData[0],
        ]);
    }

    public function view(Request $request, string $voteKey): Response
    {
        $settingsData = Settings::first();
        $epoch = $settingsData->epoch ?? null;
        
        $query = DB::table('data.validators')
            ->leftJoin('data.countries', 'data.validators.country', '=', 'data.countries.name')
            ->leftJoin('data.leader_schedule', function($join) use ($epoch) {
                $join->on('data.leader_schedule.node_pubkey', '=', 'data.validators.node_pubkey')
                     ->when($epoch, function($query, $epoch) {
                         return $query->where('data.leader_schedule.epoch', '=', $epoch);
                     });
            });
            
        $userId = $request->user() ? $request->user()->id : null;
            
        // Only join favorites table if user is authenticated
        if ($userId) {
            $query->leftJoin('data.favorites', function($join) use ($userId) {
                $join->on('data.validators.id', '=', 'data.favorites.validator_id')
                     ->where('data.favorites.user_id', '=', $userId);
            })
            ->select('data.validators.*', 'data.leader_schedule.slots as slots', 'data.favorites.id as favorite_id', 'data.countries.iso as country_iso', 'data.countries.iso3 as country_iso3', 'data.countries.phone_code as country_phone_code');
        } else {
            $query->select('data.validators.*', 'data.leader_schedule.slots as slots', 'data.countries.iso as country_iso', 'data.countries.iso3 as country_iso3', 'data.countries.phone_code as country_phone_code');
        }
        
        $validatorData = $query
            ->where('data.validators.vote_pubkey', '=', $voteKey);
            
        $validatorData = $validatorData
            ->orderBy('data.validators.id')
            ->first();

        $totalStakeQuery = "
            SELECT COALESCE(SUM(activated_stake) / 1000000000.0, 0) as total_network_stake_sol,
                COUNT(*) as validator_count,
                COUNT(activated_stake) as stake_count
            FROM data.validators
            WHERE activated_stake IS NOT NULL
                AND epoch_credits IS NOT NULL
        ";    
        $totalStake = DB::select($totalStakeQuery)[0];

        return Inertia::render('Validators/View', [
            'validatorData' => $validatorData,
            'settingsData' => $settingsData,
            'totalStakeData' => $totalStake,
        ]);
    }

    /**
     * Fetch validator metrics for SFDP calculation
     */
    public function getValidatorMetrics(Request $request)
    {
        $votePubkey = $request->get('votePubkey');
        $validatorIdentityPubkey = $request->get('validatorIdentityPubkey');
        
        if (!$votePubkey) {
            return response()->json(['error' => 'votePubkey is required'], 400);
        }
        
        // Get the validator data
        $validator = DB::table('data.validators')
            ->where('vote_pubkey', $votePubkey)
            ->first();
            
        if (!$validator) {
            return response()->json(['error' => 'Validator not found'], 404);
        }
        
        // Get current epoch from settings
        $settings = DB::table('data.settings')->first();
        $currentEpoch = $settings ? $settings->epoch : 0;
        
        // Get self-stake for this validator from stake_accounts table for all available epochs
        $selfStakeData = DB::table('data.stake_accounts')
            ->select('epoch', DB::raw('SUM(lamports) as total_lamports'))
            ->where('node_pubkey', $validatorIdentityPubkey)
            ->where('is_self_stake', true)
            ->groupBy('epoch')
            ->orderBy('epoch')
            ->get();
            
        // Convert to associative array for easier access
        $selfStakeByEpoch = [];
        foreach ($selfStakeData as $data) {
            $selfStakeByEpoch[$data->epoch] = $data->total_lamports / 1000000000; // Convert lamports to SOL
        }
        
        // Get current self-stake (for backward compatibility)
        $selfStakeLamports = DB::table('data.stake_accounts')
            ->where('node_pubkey', $validatorIdentityPubkey)
            ->where('is_self_stake', true)
            ->where('epoch', $currentEpoch)
            ->sum('lamports');
            
        $selfStake = $selfStakeLamports / 1000000000; // Convert lamports to SOL
        
        // Calculate self-stake trend information
        $selfStakeTrend = $this->calculateSelfStakeTrend($selfStakeByEpoch, $currentEpoch);
        
        // Get all validators to calculate cluster average
        $allValidators = DB::table('data.validators')
            ->whereNotNull('epoch_credits')
            ->get();
            
        // Calculate cluster average vote credits
        $totalCredits = 0;
        $validValidatorCount = 0;
        
        foreach ($allValidators as $v) {
            $epochCredits = json_decode($v->epoch_credits, true);
            if (!empty($epochCredits) && is_array($epochCredits)) {
                $lastCredit = end($epochCredits);
                if (is_array($lastCredit) && count($lastCredit) >= 2) {
                    $totalCredits += $lastCredit[1];
                    $validValidatorCount++;
                }
            }
        }
        
        $clusterAverageCredits = $validValidatorCount > 0 ? $totalCredits / $validValidatorCount : 0;
        
        // Get vote credits for current epoch
        $currentEpochCredits = 0;
        if ($validator->epoch_credits) {
            $epochCredits = json_decode($validator->epoch_credits, true);
            if (!empty($epochCredits) && is_array($epochCredits)) {
                $lastCredit = end($epochCredits);
                if (is_array($lastCredit) && count($lastCredit) >= 2) {
                    $currentEpochCredits = $lastCredit[1];
                }
            }
        }
        
        $metrics = [
            'validator' => [
                'name' => $validator->name,
                'votePubkey' => $validator->vote_pubkey,
                'nodePubkey' => $validator->node_pubkey,
                'currentEpoch' => $currentEpoch
            ],
            'voteCredits' => $currentEpochCredits,
            'clusterAverageCredits' => $clusterAverageCredits,
            'isDelinquent' => (bool)$validator->delinquent,
            'commission' => (int)($validator->commission ?? 0),
            'totalStake' => $validator->activated_stake ? $validator->activated_stake / 1000000000 : 0, // Convert lamports to SOL
            'selfStake' => $selfStake,
            'selfStakeHistory' => $selfStakeByEpoch, // Historical self-stake data
            'selfStakeTrend' => $selfStakeTrend, // Trend analysis of self-stake
            'infraConcentration' => null, // Not available in database
            'softwareVersion' => $validator->version ?? "unknown",
            'frankendancerVersion' => "unknown", // Not available in database
            'reportedEpochs' => null, // Not available in database
            'testnetEligibleEpochs' => null, // Not available in database
            'jitoMevCommission' => $validator->jito_commission ? $validator->jito_commission / 100 : null // Convert basis points to percentage
        ];
        
        return response()->json($metrics);
    }
    
    /**
     * Calculate trend information for self-stake based on historical data
     */
    private function calculateSelfStakeTrend($selfStakeByEpoch, $currentEpoch)
    {
        if (empty($selfStakeByEpoch)) {
            return [
                'trend' => 'unknown',
                'changePercent' => 0,
                'average' => 0,
                'min' => 0,
                'max' => 0
            ];
        }
        
        // Sort epochs in descending order to get the most recent first
        krsort($selfStakeByEpoch);
        $epochs = array_keys($selfStakeByEpoch);
        
        // Get the most recent and oldest values
        $mostRecentValue = $selfStakeByEpoch[$currentEpoch] ?? reset($selfStakeByEpoch);
        $oldestValue = end($selfStakeByEpoch);
        
        // Calculate percentage change
        $changePercent = 0;
        if ($oldestValue > 0) {
            $changePercent = (($mostRecentValue - $oldestValue) / $oldestValue) * 100;
        }
        
        // Calculate average
        $average = array_sum($selfStakeByEpoch) / count($selfStakeByEpoch);
        
        // Get min and max values
        $min = min($selfStakeByEpoch);
        $max = max($selfStakeByEpoch);
        
        // Determine trend
        $trend = 'stable';
        if ($changePercent > 5) {
            $trend = 'increasing';
        } elseif ($changePercent < -5) {
            $trend = 'decreasing';
        }
        
        return [
            'trend' => $trend,
            'changePercent' => round($changePercent, 2),
            'average' => round($average, 2),
            'min' => round($min, 2),
            'max' => round($max, 2)
        ];
    }

    /**
     * Fetch aggregated historical metrics for a validator
     */
    public function getHistoricalMetrics(Request $request)
    {
        $votePubkey = $request->get('votePubkey');
        $validatorIdentityPubkey = $request->get('validatorIdentityPubkey');
        
        if (!$votePubkey) {
            return response()->json(['error' => 'votePubkey is required'], 400);
        }
        
        // Get the validator data
        $validator = DB::table('data.validators')
            ->where('vote_pubkey', $votePubkey)
            ->first();
            
        if (!$validator) {
            return response()->json(['error' => 'Validator not found'], 404);
        }
        
        // Get current epoch from settings
        $settings = DB::table('data.settings')->first();
        $currentEpoch = $settings ? $settings->epoch : 0;
        
        // Get self-stake for this validator from stake_accounts table for all available epochs
        $selfStakeData = DB::table('data.stake_accounts')
            ->select('epoch', DB::raw('SUM(lamports) as total_lamports'))
            ->where('node_pubkey', $validatorIdentityPubkey)
            ->where('is_self_stake', true)
            ->groupBy('epoch')
            ->orderBy('epoch')
            ->get();
            
        // Convert to associative array for easier access
        $selfStakeByEpoch = [];
        foreach ($selfStakeData as $data) {
            $selfStakeByEpoch[$data->epoch] = $data->total_lamports / 1000000000; // Convert lamports to SOL
        }
        
        // Calculate self-stake trend information
        $selfStakeTrend = $this->calculateSelfStakeTrend($selfStakeByEpoch, $currentEpoch);
        
        // Get vote credits history
        $voteCreditsHistory = [];
        if ($validator->epoch_credits) {
            $epochCredits = json_decode($validator->epoch_credits, true);
            if (!empty($epochCredits) && is_array($epochCredits)) {
                // Get all available vote credits
                foreach ($epochCredits as $credit) {
                    $voteCreditsHistory[$credit[0]] = $credit[1]; // epoch => credits
                }
            }
        }
        
        // Calculate vote credits trend
        $voteCreditsTrend = $this->calculateVoteCreditsTrend($voteCreditsHistory, $currentEpoch);
        
        $historicalMetrics = [
            'validator' => [
                'name' => $validator->name,
                'votePubkey' => $validator->vote_pubkey,
                'nodePubkey' => $validator->node_pubkey,
                'currentEpoch' => $currentEpoch
            ],
            'selfStake' => [
                'history' => $selfStakeByEpoch,
                'trend' => $selfStakeTrend
            ],
            'voteCredits' => [
                'history' => $voteCreditsHistory,
                'trend' => $voteCreditsTrend
            ]
        ];
        
        return response()->json($historicalMetrics);
    }
    
    /**
     * Calculate trend information for vote credits based on historical data
     */
    private function calculateVoteCreditsTrend($voteCreditsHistory, $currentEpoch)
    {
        if (empty($voteCreditsHistory)) {
            return [
                'trend' => 'unknown',
                'changePercent' => 0,
                'average' => 0,
                'min' => 0,
                'max' => 0
            ];
        }
        
        // Sort epochs in descending order to get the most recent first
        krsort($voteCreditsHistory);
        $epochs = array_keys($voteCreditsHistory);
        
        // Get the most recent and oldest values
        $mostRecentValue = $voteCreditsHistory[$currentEpoch] ?? reset($voteCreditsHistory);
        $oldestValue = end($voteCreditsHistory);
        
        // Calculate percentage change
        $changePercent = 0;
        if ($oldestValue > 0) {
            $changePercent = (($mostRecentValue - $oldestValue) / $oldestValue) * 100;
        }
        
        // Calculate average
        $average = array_sum($voteCreditsHistory) / count($voteCreditsHistory);
        
        // Get min and max values
        $min = min($voteCreditsHistory);
        $max = max($voteCreditsHistory);
        
        // Determine trend
        $trend = 'stable';
        if ($changePercent > 5) {
            $trend = 'increasing';
        } elseif ($changePercent < -5) {
            $trend = 'decreasing';
        }
        
        return [
            'trend' => $trend,
            'changePercent' => round($changePercent, 2),
            'average' => round($average, 2),
            'min' => round($min, 2),
            'max' => round($max, 2)
        ];
    }

    /**
     * Display admin listing of validators
     */
    public function adminIndex(Request $request): Response
    {
        $limit = 10;
        $page = max(1, (int) $request->get('page', 1));
        $offset = ($page - 1) * $limit;
        $filterType = $request->get('filterType', 'all');
        $searchTerm = $request->get('search', '');
        $sortColumn = $request->get('sortColumn', 'id');
        $sortDirection = $request->get('sortDirection', 'ASC');
        $userId = $request->user() ? $request->user()->id : null;

        // Get total stake data
        $stakeData = $this->totalStakeService->getTotalStake();
        $totalStakeLamports = $stakeData[0]->total_network_stake_sol * 1000000000;

        // Fetch timeout data using service (this includes search and sorting functionality)
        $data = $this->validatorDataService->timeoutData(
            $sortColumn, 
            $sortDirection, 
            $totalStakeLamports,
            $userId, 
            $filterType, 
            $limit, 
            $offset, 
            $searchTerm
        );

        // Get all validators for TVC rank calculation
        $validatorsAllData = DB::table('data.validators')
            ->orderBy('activated_stake', 'DESC')->get();
        $sortedValidators = $validatorsAllData->toArray();

        // Get top validators
        $topValidatorsWithRanks = $this->validatorDataService->fetchDataTopValidators($sortedValidators, $totalStakeLamports);

        return Inertia::render('Validators/Admin/Index', [
            'validatorsData' => $data['validatorsData'],
            'settingsData' => Settings::first(),
            'totalCount' => $data['filteredTotalCount'],
            'currentPage' => $page,
            'filterType' => $filterType,
            'totalStakeData' => $stakeData[0],
            'topValidatorsData' => $topValidatorsWithRanks
        ]);
    }

    public function addCompare(Request $request) {
        $user = $request->user();
        $validatorId = $request->input('validatorId');
        
        // Use Eloquent model instead of database function
        $favorite = Favorits::where('user_id', $user->id)
                           ->where('validator_id', $validatorId)
                           ->first();
        
        if ($favorite) {
            // Remove from favorites
            $favorite->delete();
            $message = 'Validator removed from comparison list';
        } else {
            // Add to favorites
            Favorits::create([
                'user_id' => $user->id,
                'validator_id' => $validatorId
            ]);
            $message = 'Validator added to comparison list';
        }
        
        return response()->json([
            'success' => true,
            'message' => $message
        ]);
    }

    public function addFavorite(Request $request) {
        $user = $request->user();
        $validatorId = $request->input('validatorId');
        
        // Use Eloquent model instead of database function
        $favorite = Favorits::where('user_id', $user->id)
                           ->where('validator_id', $validatorId)
                           ->first();
        
        if ($favorite) {
            // Remove from favorites
            $favorite->delete();
            $message = 'Validator removed from favorites';
        } else {
            // Add to favorites
            Favorits::create([
                'user_id' => $user->id,
                'validator_id' => $validatorId
            ]);
            $message = 'Validator added to favorites';
        }
        
        return response()->json([
            'success' => true,
            'message' => $message
        ]);
    }

    public function banValidator(Request $request) {
        $user = $request->user();
        $validatorId = $request->input('validatorId');
        
        // For now, we'll use the same toggle approach for banning
        // You might want to implement a separate ban table or field
        $favorite = Favorits::where('user_id', $user->id)
                           ->where('validator_id', $validatorId)
                           ->first();
        
        if ($favorite) {
            // Remove from favorites (unban)
            $favorite->delete();
            $message = 'Validator unbanned';
        } else {
            // Add to favorites (ban)
            Favorits::create([
                'user_id' => $user->id,
                'validator_id' => $validatorId
            ]);
            $message = 'Validator banned';
        }
        
        return response()->json([
            'success' => true,
            'message' => $message
        ]);
    }

    public function comparisons(Request $request) {
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
        // Fetch validators data using service
        $validators = $this->validatorDataService->fetchDataFavoriteValidators($userId, $filterType, $offset, $totalStakeLamports, $favoriteIds);
        $filteredTotalCount = $validators['totalFilteredValidators'];

        return Inertia::render('Comparisons/Index', [
            'validatorsData' => $validators['results'],
            'settingsData' => Settings::first(),
            'totalCount' => $filteredTotalCount,
            'currentPage' => $page,
            'filterType' => $filterType,
            'totalStakeData' => $stakeData[0],
        ]);
    }

    public function favorites(Request $request) {
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
        // Fetch validators data using service
        $validators = $this->validatorDataService->fetchDataFavoriteValidators($userId, $filterType, $offset, $totalStakeLamports, $favoriteIds);
        // dd($validators['results']);exit;
        $sortedValidators = $validators['validatorsAllData']->toArray();
        $filteredTotalCount = $validators['totalFilteredValidators'];

        // Get top validators
        $topValidatorsWithRanks = $this->validatorDataService->fetchDataTopValidators($sortedValidators, $totalStakeLamports);

        return Inertia::render('Favorites/Index', [
            'validatorsData' => $validators['results'],
            'settingsData' => Settings::first(),
            'totalCount' => $filteredTotalCount,
            'currentPage' => $page,
            'filterType' => $filterType,
            'totalStakeData' => $stakeData[0],
            'topValidatorsData' => $topValidatorsWithRanks
        ]);
    }
}