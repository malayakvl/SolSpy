<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Settings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\SpyRankService;
use App\Services\TotalStakeService;
use App\Services\ValidatorDataService;
use App\Models\ValidatorOrder;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use phpseclib3\Net\SSH2;

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

    public function timeoutData(Request $request)
    {
        $page = max(1, (int) $request->input('page', 1)); // Получаем номер страницы с фронтенда, приводим к integer с минимумом 1
        $limit = 10; // Количество записей на страницу
        $offset = ($page - 1) * $limit; // Расчет offset
        $filterType = $request->input('filterType', 'all'); // Get filter type
        $searchTerm = $request->input('search', ''); // Get search term
        $sortColumn = $request->input('sortColumn', 'id'); // Get sort column
        $sortDirection = $request->input('sortDirection', 'ASC'); // Get sort direction
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

    public function timeoutFavoriteData(Request $request)
    {
        $page = max(1, (int) $request->input('page', 1)); // Получаем номер страницы с фронтенда, приводим к integer с минимумом 1
        $limit = 10; // Количество записей на страницу
        $offset = ($page - 1) * $limit; // Расчет offset
        $filterType = $request->input('filterType', 'all'); // Get filter type
        $searchTerm = $request->input('search', ''); // Get search term
        $sortColumn = $request->input('sortColumn', 'id'); // Get sort column
        $sortDirection = $request->input('sortDirection', 'ASC'); // Get sort direction
        $userId = $request->user() ? $request->user()->id : null;
        
        // For unauthenticated users, get favorite validator IDs from request parameter
        $favoriteIds = null;
        if (!$userId) {
            $favoriteIds = $request->input('validatorFavorites', []); // Get from localStorage parameter
            if (is_string($favoriteIds)) {
                $favoriteIds = json_decode($favoriteIds, true) ?: [];
            }
        }
        
        // Get total stake data
        $stakeData = $this->totalStakeService->getTotalStake();
        $totalStakeLamports = $stakeData[0]->total_network_stake_sol * 1000000000;

        // Fetch timeout data using service
        $data = $this->validatorDataService->timeoutFavoriteData(
            $sortColumn, 
            $sortDirection, 
            $totalStakeLamports,
            $userId, 
            $filterType, 
            $limit, 
            $offset, 
            $searchTerm,
            $favoriteIds
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

    public function timeoutComparisonData(Request $request)
    {
        $page = max(1, (int) $request->input('page', 1)); // Получаем номер страницы с фронтенда, приводим к integer с минимумом 1
        $limit = 10; // Количество записей на страницу
        $offset = ($page - 1) * $limit; // Расчет offset
        $filterType = $request->input('filterType', 'all'); // Get filter type
        $searchTerm = $request->input('search', ''); // Get search term
        $sortColumn = $request->input('sortColumn', 'id'); // Get sort column
        $sortDirection = $request->input('sortDirection', 'ASC'); // Get sort direction
        $userId = $request->user() ? $request->user()->id : null;
        
        // For unauthenticated users, get favorite validator IDs from request parameter
        $compareIds = null;
        if (!$userId) {
            $compareIds = $request->input('validatorCompare', []); // Get from localStorage parameter
            if (is_string($compareIds)) {
                $compareIds = json_decode($compareIds, true) ?: [];
            }
        }
        
        // Get total stake data
        $stakeData = $this->totalStakeService->getTotalStake();
        $totalStakeLamports = $stakeData[0]->total_network_stake_sol * 1000000000;

        // Fetch timeout data using service
        $data = $this->validatorDataService->timeoutCompareData(
            $sortColumn, 
            $sortDirection, 
            $totalStakeLamports,
            $userId, 
            $filterType, 
            $limit, 
            $offset, 
            $searchTerm,
            $compareIds
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

    /**
     * Public method for fetching favorite validators for unauthenticated users
     */
    public function publicFavoriteData(Request $request)
    {
        $page = max(1, (int) $request->input('page', 1)); // Получаем номер страницы с фронтенда, приводим к integer с минимумом 1
        $limit = 10; // Количество записей на страницу
        $offset = ($page - 1) * $limit; // Расчет offset
        $filterType = $request->input('filterType', 'all'); // Get filter type
        $searchTerm = $request->input('search', ''); // Get search term
        $sortColumn = $request->input('sortColumn', 'id'); // Get sort column
        $sortDirection = $request->input('sortDirection', 'ASC'); // Get sort direction
        // For unauthenticated users, get favorite validator IDs from request parameter
        $favoriteIds = $request->input('ids', []); // Get from localStorage parameter
        if (is_string($favoriteIds)) {
            $favoriteIds = json_decode($favoriteIds, true) ?: [];
        }
        
        // Get total stake data
        $stakeData = $this->totalStakeService->getTotalStake();
        $totalStakeLamports = $stakeData[0]->total_network_stake_sol * 1000000000;

        // Fetch timeout data using service
        $data = $this->validatorDataService->timeoutFavoriteData(
            $sortColumn, 
            $sortDirection, 
            $totalStakeLamports,
            null, // userId is null for public access
            $filterType, 
            $limit, 
            $offset, 
            $searchTerm,
            $favoriteIds
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

    /**
     * Public method for fetching favorite validators for unauthenticated users
     */
    public function publicComparisonData(Request $request)
    {
        $page = max(1, (int) $request->input('page', 1)); // Получаем номер страницы с фронтенда, приводим к integer с минимумом 1
        $limit = 10; // Количество записей на страницу
        $offset = ($page - 1) * $limit; // Расчет offset
        $filterType = $request->input('filterType', 'all'); // Get filter type
        $searchTerm = $request->input('search', ''); // Get search term
        $sortColumn = $request->input('sortColumn', 'id'); // Get sort column
        $sortDirection = $request->input('sortDirection', 'ASC'); // Get sort direction
        // For unauthenticated users, get favorite validator IDs from request parameter
        $favoriteIds = $request->input('ids', []); // Get from localStorage parameter
        if (is_string($favoriteIds)) {
            $favoriteIds = json_decode($favoriteIds, true) ?: [];
        }
        
        // Get total stake data
        $stakeData = $this->totalStakeService->getTotalStake();
        $totalStakeLamports = $stakeData[0]->total_network_stake_sol * 1000000000;

        // Fetch timeout data using service
        $data = $this->validatorDataService->timeoutFavoriteData(
            $sortColumn, 
            $sortDirection, 
            $totalStakeLamports,
            null, // userId is null for public access
            $filterType, 
            $limit, 
            $offset, 
            $searchTerm,
            $favoriteIds
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

    public function removeComparisons(Request $request) {
        $userId = $request->user() ? $request->user()->id : null;
        $validatorId = $request->input('validatorId');

        $validator = DB::table('data.validators_comparison')
            ->where('validator_id', $validatorId)
            ->where('user_id', $userId)
            ->delete();

    }


    public function fetchByIds(Request $request) {
        $userId = $request->user() ? $request->user()->id : null;
        
        // Handle both query parameter and request body
        $ids = $request->input('ids', []);
        if (is_string($ids)) {
            $ids = explode(',', $ids);
        }
        $ids = array_filter($ids); // Remove empty values
        
        if (empty($ids)) {
            return response()->json([
                'validators' => []
            ]);
        }
        
        $query = DB::table('data.validators')
            ->leftJoin('data.countries', 'data.validators.country', '=', 'data.countries.name');
        
        // Only join favorites table if user is authenticated
        if ($userId) {
            $query->leftJoin('data.favorites', function($join) use ($userId) {
                $join->on('data.validators.id', '=', 'data.favorites.validator_id')
                     ->where('data.favorites.user_id', '=', $userId);
            })
            ->select('data.validators.*', 'data.favorites.id as favorite_id', 'data.countries.iso as country_iso', 'data.countries.iso3 as country_iso3', 'data.countries.phone_code as country_phone_code');
        } else {
            $query->select('data.validators.*', 'data.countries.iso as country_iso', 'data.countries.iso3 as country_iso3', 'data.countries.phone_code as country_phone_code');
        }
        
        $validatorsData = $query
            ->whereIn('data.validators.id', $ids)
            ->orderBy('data.validators.id')
            ->get();

        return response()->json([
            'validators' => $validatorsData
        ]);
    }

    /**
     * Fetch validator metrics for SFDP calculation
     */
    public function getValidatorMetrics(Request $request)
    {
        $votePubkey = $request->input('votePubkey');
        $validatorIdentityPubkey = $request->input('validatorIdentityPubkey');
        
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
        $votePubkey = $request->input('votePubkey');
        $validatorIdentityPubkey = $request->input('validatorIdentityPubkey');
        
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

    public function markValidators(Request $request) {
        $checkedIds = $request->input('checkedIds', []);
        $value = $request->input('value');
        if (!empty($checkedIds) && in_array($value, ['highlight', 'top'])) {
            // Determine which field to update based on value
            if ($value === 'highlight')
                $field = 'is_highlighted';
            elseif ($value === 'top')
                $field = 'is_top';

            // Toggle field: false -> true, true -> false
            DB::statement(
                "UPDATE data.validators SET {$field} = NOT {$field} WHERE id = ANY(?)",
                ['{' . implode(',', $checkedIds) . '}']
            );
        }

        if (request()->header('X-Inertia')) {
            return back();
        }
    }

    public function addCompare(Request $request) {
        $user = $request->user();
        $validatorId = $request->input('validatorId');
        DB::statement('SELECT data.toggle_comparisons(' .$user->id. ', ' .$validatorId. ')');
        
        return response()->json([
            'success' => true,
            'message' => 'Comparison list updated'
        ]);
    }

    public function addFavorite(Request $request) {
        $user = $request->user();
        if ($user->id) {
            $validatorId = $request->input('validatorId');
            DB::statement('SELECT data.toggle_favorite(' .$user->id. ', ' .$validatorId. ')');
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Favorites list updated'
        ]);
    }

    public function banValidator(Request $request) {
        $user = $request->user();
        $validatorId = $request->input('validatorId');
        // Assuming there's a ban function in the database
        $result = DB::statement('SELECT data.toggle_ban(' .$user->id. ', ' .$validatorId. ')');
        
        return response()->json([
            'success' => true,
            'message' => 'Ban status updated'
        ]);
    }

    public function updateOrder(Request $request)
    {
        // $request->validate([
        //     'validatorIds' => 'required|array',
        //     'validatorIds.*' => 'integer|exists:validators,id',
        //     'listType' => 'required|string'
        // ]);
        
        $validatorIds = $request->input('validatorIds');
        $listType = $request->input('listType', 'top');
        // Removed debugging statement
        // exit;
        // Use a transaction to ensure data consistency
        // DB::transaction(function () use ($validatorIds, $listType) {
        //     // Delete existing order records for this list type
        //     ValidatorOrder::where('list_type', $listType)->delete();
            
        //     // Create new order records
        //     foreach ($validatorIds as $index => $validatorId) {
        //         ValidatorOrder::create([
        //             'validator_id' => $validatorId,
        //             'sort_order' => $index,
        //             'list_type' => $listType
        //         ]);
        //     }
        // });
        
        return response()->json(['message' => 'Order updated successfully']);
    }
    
    /**
     * Get the order of validators for a specific list type
     *
     * @param  string  $listType
     * @return \Illuminate\Http\Response
     */
    public function getOrder($listType = 'top')
    {
        $orderRecords = ValidatorOrder::where('list_type', $listType)
            ->join('validators', 'validator_orders.validator_id', '=', 'validators.id')    
            ->orderBy('sort_order')
            ->get(['validator_id', 'sort_order']);
            // Removed debugging statement
            // exit;
        return response()->json($orderRecords);
    }


    public function getValidatorScore(Request $request)
    {
        $pubkey = $request->query('pubkey');
        
        // Simple validation - ensure we have a pubkey parameter
        if (!$pubkey) {
            return response()->json(['error' => 'pubkey parameter required'], 400);
        }

        // Кэшируем данные на 10 секунд
        $data = Cache::remember('validator_' . $pubkey, 10, function () use ($pubkey) {
            // Check if we should use SSH (for local development) or direct execution (for server)
            $useSSH = env('VALIDATOR_USE_SSH', false);
            
            if ($useSSH) {
                return $this->getValidatorScoreViaSSH($pubkey);
            } else {
                return $this->getValidatorScoreLocally($pubkey);
            }
        });

        if (isset($data['error'])) {
            return response()->json(['error' => $data['error']], 404);
        }

        return response()->json($data);
    }
    
    /**
     * Get validator score via SSH connection (for local development)
     */
    private function getValidatorScoreViaSSH($pubkey)
    {
        $ssh = null;
        try {
            // Подключение к удалённому серверу
            $ssh = new SSH2(env('VALIDATOR_SERVER_HOST', '103.167.235.81')); // IP сервера
            
            // Set timeout for the connection
            $ssh->setTimeout(30);
            
            // Try to login
            $loginSuccess = $ssh->login(env('VALIDATOR_SERVER_USER', 'root'), env('VALIDATOR_SERVER_PASSWORD'));
            
            if (!$loginSuccess) {
                Log::error('SSH login failed for validator score fetch - login returned false');
                return ['error' => 'SSH login failed - invalid credentials'];
            }

            // Use the confirmed working path for solana command
            $solanaPath = "/root/.local/share/solana/install/active_release/bin/solana";
            
            // Use the exact same command that works on the server
            $validatorCommand = "$solanaPath validators -um --sort=credits -r -n | grep -e " . escapeshellarg($pubkey);
            $output = $ssh->exec($validatorCommand);
            $exitStatus = $ssh->getExitStatus();

            // Even if grep returns exit status 1 (not found), we might still have output
            // Only consider it an error if we have no output
            if (!$output || trim($output) === '') {
                Log::error('Validator not found for pubkey: ' . $pubkey . ' Exit status: ' . $exitStatus);
                return ['error' => 'Validator not found', 'pubkey' => $pubkey, 'exit_status' => $exitStatus];
            }

            // Парсинг: "192 Hgo... DHo... 0% 368557078 ( 0) 368557047 ( 0) 0.00% 975094 2.3.8 15888.204260276 SOL (0.00%)"
            $parts = preg_split('/\s+/', trim($output));

            // Based on the actual output, we need 17 parts minimum
            if (count($parts) < 17) {
                Log::error('Invalid CLI output format for pubkey: ' . $pubkey . ' with parts count: ' . count($parts));
                Log::error('Output was: ' . $output);
                return ['error' => 'Invalid CLI output format', 'parts_count' => count($parts), 'output' => $output, 'parts' => $parts];
            }

            // Parse the output correctly based on actual format
            return [
                'rank' => (int)$parts[0],                    // 186
                'votePubkey' => $parts[2],                   // HgozywotiKv4F5g3jCgideF3gh9sdD3vz4QtgXKjWCtB
                'nodePubkey' => $parts[3],                   // DHoZJqvvMGvAXw85Lmsob7YwQzFVisYg8HY4rt5BAj6M
                'uptime' => $parts[4],                       // 0%
                'rootSlot' => (int)str_replace(['(', ')'], '', $parts[5]), // 368561621
                'voteSlot' => (int)str_replace(['(', ')'], '', $parts[8]), // 368561590
                'commission' => (float)str_replace('%', '', $parts[11]),   // 0.00%
                'credits' => (int)$parts[12],                // 1047512
                'version' => $parts[13],                     // 2.3.8
                'stake' => $parts[14],                       // 15888.204260276
                'stakePercent' => str_replace(['(', ')', '%'], '', $parts[16]), // 0.00%
            ];
        } catch (\Exception $e) {
            Log::error('Exception in getValidatorScoreViaSSH: ' . $e->getMessage());
            return ['error' => 'Exception occurred: ' . $e->getMessage()];
        } finally {
            // Ensure SSH connection is closed
            if ($ssh instanceof SSH2) {
                try {
                    $ssh->disconnect();
                } catch (\Exception $e) {
                    Log::warning('Failed to disconnect SSH: ' . $e->getMessage());
                }
            }
        }
    }
    
    /**
     * Get validator score locally (for server deployment)
     */
    private function getValidatorScoreLocally($pubkey)
    {
        try {
            // First check if solana command exists
            $checkCommand = Process::fromShellCommandline("which solana");
            $checkCommand->run();
            
            if (!$checkCommand->isSuccessful()) {
                Log::error('Solana command not found on local system');
                return ['error' => 'Solana command not found on local system. Please install Solana CLI tools.'];
            }
            
            // Get the path to solana command
            $solanaPath = trim($checkCommand->getOutput());
            if (empty($solanaPath)) {
                $solanaPath = "solana"; // fallback to just 'solana'
            }
            
            // Execute the solana command directly
            $command = "$solanaPath validators -um --sort=credits -r -n | grep -e " . escapeshellarg($pubkey);
            $process = Process::fromShellCommandline($command);
            $process->setTimeout(30);
            $process->run();
            
            if (!$process->isSuccessful()) {
                // Check if it's a "not found" error or actual validator not found
                $errorOutput = $process->getErrorOutput();
                $output = $process->getOutput();
                
                // If we have output, it might still be valid (grep returns 1 when no matches found)
                if ($output && trim($output) !== '') {
                    // Continue with parsing
                } else {
                    Log::error('Validator not found or command failed for pubkey: ' . $pubkey . ' Error: ' . $errorOutput . ' Output: ' . $output);
                    return ['error' => 'Validator not found or command failed', 'pubkey' => $pubkey, 'error_output' => $errorOutput, 'output' => $output];
                }
            }
            
            $output = $process->getOutput();
            
            if (!$output || trim($output) === '') {
                Log::error('Validator not found for pubkey: ' . $pubkey);
                return ['error' => 'Validator not found', 'pubkey' => $pubkey, 'output' => $output];
            }

            // Парсинг: "192 Hgo... DHo... 0% 368557078 ( 0) 368557047 ( 0) 0.00% 975094 2.3.8 15888.204260276 SOL (0.00%)"
            $parts = preg_split('/\s+/', trim($output));

            // Based on the actual output, we need 17 parts minimum
            if (count($parts) < 17) {
                Log::error('Invalid CLI output format for pubkey: ' . $pubkey . ' with parts count: ' . count($parts));
                Log::error('Output was: ' . $output);
                return ['error' => 'Invalid CLI output format', 'parts_count' => count($parts), 'output' => $output, 'parts' => $parts];
            }

            // Parse the output correctly based on actual format
            return [
                'rank' => (int)$parts[0],                    // 186
                'votePubkey' => $parts[2],                   // HgozywotiKv4F5g3jCgideF3gh9sdD3vz4QtgXKjWCtB
                'nodePubkey' => $parts[3],                   // DHoZJqvvMGvAXw85Lmsob7YwQzFVisYg8HY4rt5BAj6M
                'uptime' => $parts[4],                       // 0%
                'rootSlot' => (int)str_replace(['(', ')'], '', $parts[5]), // 368561621
                'voteSlot' => (int)str_replace(['(', ')'], '', $parts[8]), // 368561590
                'commission' => (float)str_replace('%', '', $parts[11]),   // 0.00%
                'credits' => (int)$parts[12],                // 1047512
                'version' => $parts[13],                     // 2.3.8
                'stake' => $parts[14],                       // 15888.204260276
                'stakePercent' => str_replace(['(', ')', '%'], '', $parts[16]), // 0.00%
            ];
        } catch (\Exception $e) {
            Log::error('Exception in getValidatorScoreLocally: ' . $e->getMessage());
            return ['error' => 'Exception occurred: ' . $e->getMessage()];
        }
    }
}