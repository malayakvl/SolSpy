<?php

namespace App\Http\Controllers;

use App\Models\Settings;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\SpyRankService;

class ValidatorController extends Controller
{
    //
    public function index(Request $request): Response
    {
        $limit = 10; // Количество записей на страницу
        $page = max(1, (int) $request->get('page', 1)); // Получение page из request с default значением 1
        $offset = ($page - 1) * $limit; // Расчет offset
        $filterType = $request->get('filterType', 'all'); // Get filter type
        $userId = $request->user() ? $request->user()->id : null;
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
        
        $validatorsData = $query;
        
        // Apply filter based on filterType
        if ($filterType === 'highlight') {
            $validatorsData = $validatorsData->where('data.validators.is_highlighted', true);
        } elseif ($filterType === 'top') {
            $validatorsData = $validatorsData->where('data.validators.is_top', true);
        }
        
        // Add the hack to filter validators starting from ID 19566
        $validatorsData = $validatorsData->where('data.validators.id', '>=', '19566');
        
        $validatorsData = $validatorsData
            ->orderBy('data.validators.id')
            ->limit(10)->offset($offset)->get();
        // Calculate total count based on filter
        $totalCountQuery = DB::table('data.validators');
            
        // Apply same filter for count
        if ($filterType === 'highlight') {
            $totalCountQuery = $totalCountQuery->where('data.validators.is_highlighted', true);
        } elseif ($filterType === 'top') {
            $totalCountQuery = $totalCountQuery->where('data.validators.is_top', true);
        }
        
        // Add the hack to filter validators starting from ID 19566 for count as well
        $totalCountQuery = $totalCountQuery->where('data.validators.id', '>=', '19566');
        
        $filteredTotalCount = $totalCountQuery->count();
        
        $totalStakeQuery = "
            SELECT COALESCE(SUM(activated_stake) / 1000000000.0, 0) as total_network_stake_sol,
                COUNT(*) as validator_count,
                COUNT(activated_stake) as stake_count
            FROM data.validators
            WHERE activated_stake IS NOT NULL
                AND epoch_credits IS NOT NULL
        ";    
        $totalStake = DB::select($totalStakeQuery)[0];

        $validatorsAllData = DB::table('data.validators')
            ->orderBy('activated_stake', 'DESC')->get();
        $sortedValidators = $validatorsAllData->toArray();

        // Calculate total network stake in lamports for spyRank calculation
        $totalStakeLamports = $totalStake->total_network_stake_sol * 1000000000;

        // Инициализация SpyRankService
        $spyRankService = new SpyRankService();

        // Рассчитываем tvcRank и spyRank для каждого валидатора из $validatorsData
        $results = $validatorsData->map(function ($validator) use ($sortedValidators, $spyRankService, $totalStakeLamports) {
            // Находим индекс валидатора в отсортированном массиве по vote_pubkey
            $tvcRank = array_search($validator->vote_pubkey, array_column($sortedValidators, 'vote_pubkey')) + 1;

            // Добавляем tvcRank к объекту валидатора
            $validator->tvcRank = $tvcRank ?: 'Not found'; // Если не найден, возвращаем 'Not found'
            
            // Calculate spyRank
            $validator->spyRank = $spyRankService->calculateSpyRank($validator, $totalStakeLamports);
            
            return $validator;
        });

        //getting top validators
        $topValidators = DB::table('data.validators')
            ->where('data.validators.is_top', true)
            ->orderBy('data.validators.activated_stake', 'DESC')
            ->limit(10)
            ->get();

        // Calculate TVC rank and Spy rank for top validators as well
        $topValidatorsWithRanks = $topValidators->map(function ($validator) use ($sortedValidators, $spyRankService, $totalStakeLamports) {
            // Calculate TVC rank
            $tvcRank = array_search($validator->vote_pubkey, array_column($sortedValidators, 'vote_pubkey')) + 1;
            $validator->tvcRank = $tvcRank ?: 'Not found';
            
            // Calculate spyRank
            $validator->spyRank = $spyRankService->calculateSpyRank($validator, $totalStakeLamports);
            
            return $validator;
        });

        if (!$request->user()) {
            return Inertia::render('Validators/Index', [
                'validatorsData' => $results,
                'settingsData' => Settings::first(),
                'totalCount' => $filteredTotalCount,
                'currentPage' => $page,
                'filterType' => $filterType,
                'totalStakeData' => $totalStake,
                'topValidatorsData' => $topValidatorsWithRanks
            ]);


        } else {
            return Inertia::render('Validators/Admin/Index', [
                'validatorsData' => $results,
                'settingsData' => Settings::first(),
                'totalCount' => $filteredTotalCount,
                'currentPage' => $page,
                'filterType' => $filterType,
                'totalStakeData' => $totalStake,
                'topValidatorsData' => $topValidatorsWithRanks
            ]);
        }
    }

    public function timeoutData(Request $request)
    {
        $page = max(1, (int) $request->get('page', 1)); // Получаем номер страницы с фронтенда, приводим к integer с минимумом 1
        $limit = 10; // Количество записей на страницу
        $offset = ($page - 1) * $limit; // Расчет offset
        $filterType = $request->get('filterType', 'all'); // Get filter type
        $searchTerm = $request->get('search', ''); // Get search term
        $sortColumn = $request->get('sortColumn', 'id'); // Get sort column
        $sortDirection = $request->get('sortDirection', 'ASC'); // Get sort direction
        $userId = $request->user() ? $request->user()->id : null;

        // Validate sort direction
        if (!in_array(strtoupper($sortDirection), ['ASC', 'DESC'])) {
            $sortDirection = 'ASC';
        }

        // Map frontend column names to database column names
        $columnMap = [
            'name' => 'data.validators.name',
            'status' => 'data.validators.delinquent',
            'spy_rank' => 'data.validators.activated_stake', // Using activated_stake as proxy for spy_rank
            'tvc_score' => 'data.validators.total_score',
            'tvc_rank' => 'data.validators.activated_stake', // TVC Rank is based on activated_stake
            'vote_credits' => 'data.validators.epoch_credits',
            'active_stake' => 'data.validators.activated_stake',
            'vote_rate' => 'data.validators.vote_distance_score',
            'inflation_commission' => 'data.validators.jito_commission',
            'mev_commission' => 'data.validators.commission',
            'uptime' => 'data.validators.skipped_slot_percent',
            'client_version' => 'data.validators.version',
            'status_sfdp' => 'data.validators.delinquent', // Using delinquent as proxy
            'location' => 'data.validators.country',
            'website' => 'data.validators.url',
            'city' => 'data.validators.city',
            'asn' => 'data.validators.autonomous_system_number',
            'ip' => 'data.validators.ip',
            'jito_score' => 'data.validators.jito_commission'
        ];

        // Get the actual database column name
        $dbSortColumn = $columnMap[$sortColumn] ?? 'data.validators.id';
        
        // For TVC Rank, we need to sort by activated_stake in descending order
        // because higher activated_stake means better (lower) rank
        $actualSortDirection = $sortDirection;
        if ($sortColumn === 'tvc_rank') {
            // Reverse the sort direction for TVC Rank
            $actualSortDirection = strtoupper($sortDirection) === 'ASC' ? 'DESC' : 'ASC';
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
        
        // Apply search filter if provided
        if (!empty($searchTerm)) {
            $query = $query->where('data.validators.name', 'ILIKE', '%' . $searchTerm . '%');
        }
        
        // Apply filter based on filterType
        if ($filterType === 'highlight') {
            $query = $query->where('data.validators.is_highlighted', true);
        } elseif ($filterType === 'top') {
            $query = $query->where('data.validators.is_top', true);
        }
        // Apply sorting
        if ($sortColumn === 'uptime') {
            // dd($sortDirection);exit;
            $query->orderBy('data.validators.avg_uptime', $sortDirection);
        } elseif ($sortColumn === 'tvc_score') {
            $query->orderBy('data.validators.id', $sortDirection);
        } elseif ($sortColumn === 'tvc_rank') {
            $query->orderBy('data.validators.activated_stake', $actualSortDirection);
        } elseif ($sortColumn === 'vote_credits') {
            $query->orderByRaw("CASE WHEN data.validators.epoch_credits IS NULL THEN 1 ELSE 0 END, data.validators.epoch_credits " . $sortDirection);
        } elseif ($sortColumn === 'active_stake') {
            $query->orderBy('data.validators.activated_stake', $sortDirection);
        } elseif ($sortColumn === 'vote_rate') {
            $query->orderBy('data.validators.vote_distance_score', $sortDirection);
        } elseif ($sortColumn === 'inflation_commission') {
            $query->orderByRaw("CASE WHEN data.validators.jito_commission IS NULL THEN 1 ELSE 0 END, data.validators.jito_commission " . $sortDirection);
        } elseif ($sortColumn === 'mev_commission') {
            $query->orderByRaw("CASE WHEN data.validators.commission IS NULL THEN 1 ELSE 0 END, data.validators.commission " . $sortDirection);
        } elseif ($sortColumn === 'client_version') {
            $query->orderByRaw("CASE WHEN data.validators.version IS NULL THEN 1 ELSE 0 END, data.validators.version " . $sortDirection);
        } elseif ($sortColumn === 'status_sfdp') {
            $query->orderBy('data.validators.delinquent', $sortDirection);
        } elseif ($sortColumn === 'location') {
            $query->orderByRaw("CASE WHEN data.validators.country IS NULL THEN 1 ELSE 0 END, data.validators.country " . $sortDirection);
        } elseif ($sortColumn === 'website') {
            $query->orderByRaw("CASE WHEN data.validators.url IS NULL THEN 1 ELSE 0 END, data.validators.url " . $sortDirection);
        } elseif ($sortColumn === 'city') {
            $query->orderByRaw("CASE WHEN data.validators.city IS NULL THEN 1 ELSE 0 END, data.validators.city " . $sortDirection);
        } elseif ($sortColumn === 'asn') {
            $query->orderByRaw("CASE WHEN data.validators.autonomous_system_number IS NULL THEN 1 ELSE 0 END, data.validators.autonomous_system_number " . $sortDirection);
        } elseif ($sortColumn === 'ip') {
            $query->orderByRaw("CASE WHEN data.validators.ip IS NULL THEN 1 ELSE 0 END, data.validators.ip " . $sortDirection);
        } elseif ($sortColumn === 'jito_score') {
            $query->orderByRaw("CASE WHEN data.validators.jito_commission IS NULL THEN 1 ELSE 0 END, data.validators.jito_commission " . $sortDirection);
        } else {
            $query->orderBy($dbSortColumn, $sortDirection);
        }
        
        // Add the hack to filter validators starting from ID 19566
        $query = $query->where('data.validators.id', '>=', '19566');
        
        $validatorsData = $query
            ->limit($limit)->offset($offset)->get();

        // Calculate total count based on filter
        $totalCountQuery = DB::table('data.validators');
        
        // Apply search filter if provided
        if (!empty($searchTerm)) {
            $totalCountQuery = $totalCountQuery->where('data.validators.name', 'ILIKE', '%' . $searchTerm . '%');
        }
            
        // Apply same filter for count
        if ($filterType === 'highlight') {
            $totalCountQuery = $totalCountQuery->where('data.validators.is_highlighted', true);
        } elseif ($filterType === 'top') {
            $totalCountQuery = $totalCountQuery->where('data.validators.is_top', true);
        }
        
        // Add the hack to filter validators starting from ID 19566 for count as well
        $totalCountQuery = $totalCountQuery->where('data.validators.id', '>=', '19566');
        
        $filteredTotalCount = $totalCountQuery->count();
        
        $validatorsAllData = DB::table('data.validators')
            ->orderBy('activated_stake', 'DESC')->get();
        $sortedValidators = $validatorsAllData->toArray();

        $totalStakeQuery = "
            SELECT COALESCE(SUM(activated_stake) / 1000000000.0, 0) as total_network_stake_sol,
                COUNT(*) as validator_count,
                COUNT(activated_stake) as stake_count
            FROM data.validators
            WHERE activated_stake IS NOT NULL
                AND epoch_credits IS NOT NULL
        ";    
        $totalStake = DB::select($totalStakeQuery)[0];

        // Calculate total network stake in lamports for spyRank calculation
        $totalStakeLamports = $totalStake->total_network_stake_sol * 1000000000;

        // Инициализация SpyRankService
        $spyRankService = new SpyRankService();

        // Рассчитываем tvcRank и spyRank для каждого валидатора из $validatorsData
        $results = $validatorsData->map(function ($validator) use ($sortedValidators, $spyRankService, $totalStakeLamports) {
            // Находим индекс валидатора в отсортированном массиве по vote_pubkey
            $tvcRank = array_search($validator->vote_pubkey, array_column($sortedValidators, 'vote_pubkey')) + 1;

            // Добавляем tvcRank к объекту валидатора
            $validator->tvcRank = $tvcRank ?: 'Not found'; // Если не найден, возвращаем 'Not found'
            
            // Calculate spyRank
            $validator->spyRank = $spyRankService->calculateSpyRank($validator, $totalStakeLamports);
            
            return $validator;
        });

        return response()->json([
            'validatorsData' => $results,
            'settingsData' => Settings::first(),
            'totalCount' => $filteredTotalCount,
            'currentPage' => $page,
            'filterType' => $filterType,
            'totalStakeData' => $totalStake,
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
        $limit = 10; // Количество записей на страницу
        $page = max(1, (int) $request->get('page', 1)); // Получение page из request с default значением 1
        $offset = ($page - 1) * $limit; // Расчет offset
        $filterType = $request->get('filterType', 'all'); // Get filter type
        $searchTerm = $request->get('search', ''); // Get search term
        $userId = $request->user() ? $request->user()->id : null;
        $sortColumn = $request->get('sortColumn', 'id');
        $sortDirection = $request->get('sortDirection', 'ASC');
        $totalStakeQuery = "
            SELECT COALESCE(SUM(activated_stake) / 1000000000.0, 0) as total_network_stake_sol,
                COUNT(*) as validator_count,
                COUNT(activated_stake) as stake_count
            FROM data.validators
            WHERE activated_stake IS NOT NULL
                AND epoch_credits IS NOT NULL
        ";    
        $totalStake = DB::select($totalStakeQuery)[0];
        
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
        
        $validatorsData = $query;
            
        // Apply search filter if provided
        if (!empty($searchTerm)) {
            $validatorsData = $validatorsData->where('data.validators.name', 'ILIKE', '%' . $searchTerm . '%');
        }
            
        // Apply filter based on filterType
        if ($filterType === 'highlight') {
            $validatorsData = $validatorsData->where('data.validators.is_highlighted', true);
        } elseif ($filterType === 'top') {
            $validatorsData = $validatorsData->where('data.validators.is_top', true);
        }
        
        // Add the hack to filter validators starting from ID 19566
        $validatorsData = $validatorsData->where('data.validators.id', '>=', '19566');
       
        if ($sortColumn === 'uptime') {
            // dd($sortDirection);exit;
            $validatorsData->orderBy('data.validators.avg_uptime', $sortDirection);
        } else {
            $validatorsData->orderBy('data.validators.id');
        }   
        $validatorsData = $validatorsData
            ->limit(10)->offset($offset)->get();

        // Calculate total count based on filter
        $totalCountQuery = DB::table('data.validators');
        
        // Apply search filter if provided
        if (!empty($searchTerm)) {
            $totalCountQuery = $totalCountQuery->where('data.validators.name', 'ILIKE', '%' . $searchTerm . '%');
        }
            
        // Apply same filter for count
        if ($filterType === 'highlight') {
            $totalCountQuery = $totalCountQuery->where('data.validators.is_highlighted', true);
        } elseif ($filterType === 'top') {
            $totalCountQuery = $totalCountQuery->where('data.validators.is_top', true);
        }
        
        // Add the hack to filter validators starting from ID 19566 for count as well
        $totalCountQuery = $totalCountQuery->where('data.validators.id', '>=', '19566');
        
        $filteredTotalCount = $totalCountQuery->count();
        
        $validatorsAllData = DB::table('data.validators')
            ->orderBy('activated_stake', 'DESC')->get();
        $sortedValidators = $validatorsAllData->toArray();

        // Calculate total network stake in lamports for spyRank calculation
        $totalStakeLamports = $totalStake->total_network_stake_sol * 1000000000;

        // Инициализация SpyRankService
        $spyRankService = new SpyRankService();

        // Рассчитываем tvcRank и spyRank для каждого валидатора из $validatorsData
        $results = $validatorsData->map(function ($validator) use ($sortedValidators, $spyRankService, $totalStakeLamports) {
            // Находим индекс валидатора в отсортированном массиве по vote_pubkey
            $tvcRank = array_search($validator->vote_pubkey, array_column($sortedValidators, 'vote_pubkey')) + 1;

            // Добавляем tvcRank к объекту валидатора
            $validator->tvcRank = $tvcRank ?: 'Not found'; // Если не найден, возвращаем 'Not found'
            
            // Calculate spyRank
            $validator->spyRank = $spyRankService->calculateSpyRank($validator, $totalStakeLamports);
            
            return $validator;
        });

        return Inertia::render('Validators/Admin/Index', [
            'validatorsData' => $results,
            'settingsData' => Settings::first(),
            'totalCount' => $filteredTotalCount,
            'currentPage' => $page,
            'filterType' => $filterType,
            'totalStakeData' => $totalStake,
        ]);
    }

    public function addCompare(Request $request) {
        $user = $request->user();
        $validatorId = $request->get('validatorId');
        $result = DB::statement('SELECT data.toggle_favorite(' .$user->id. ', ' .$validatorId. ')');
        
        return response()->json([
            'success' => true,
            'message' => 'Comparison list updated'
        ]);
    }

    public function addFavorite(Request $request) {
        $user = $request->user();
        $validatorId = $request->get('validatorId');
        $result = DB::statement('SELECT data.toggle_favorite(' .$user->id. ', ' .$validatorId. ')');
        
        return response()->json([
            'success' => true,
            'message' => 'Favorites list updated'
        ]);
    }

    public function banValidator(Request $request) {
        $user = $request->user();
        $validatorId = $request->get('validatorId');
        // Assuming there's a ban function in the database
        $result = DB::statement('SELECT data.toggle_ban(' .$user->id. ', ' .$validatorId. ')');
        
        return response()->json([
            'success' => true,
            'message' => 'Ban status updated'
        ]);
    }

}