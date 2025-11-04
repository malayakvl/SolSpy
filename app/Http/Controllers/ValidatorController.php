<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Settings;
use App\Models\Settings2User;
use App\Models\Favorits;
use App\Models\ValidatorOrder;
use App\Services\ValidatorDataService;
use App\Services\TotalStakeService;
use App\Services\SpyRankService;
use App\Services\ValidatorAveragesService;
use Illuminate\Support\Facades\DB;

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

    /**
     * Get top news items from the unified sorting table
     */
    private function getTopNewsItems()
    {
        // First, check if we need to populate the sorting table
        if (\App\Models\NewsTopSorting::count() === 0) {
            // Populate with existing top news items
            \Illuminate\Support\Facades\DB::transaction(function () {
                // Get all top news items from regular news table
                $topNewsItems = \App\Models\News::where('is_top', true)->get();
                
                // Add regular news items to sorting table
                foreach ($topNewsItems as $index => $newsItem) {
                    \App\Models\NewsTopSorting::create([
                        'news_id' => $newsItem->id,
                        'news_type' => 'news',
                        'sort_order' => $index
                    ]);
                }
                
                // Get all top news items from discord_top_news table
                $topDiscordItems = \Illuminate\Support\Facades\DB::table('data.discord_top_news')->get();
                
                // Add Discord news items to sorting table
                $startIndex = $topNewsItems->count();
                foreach ($topDiscordItems as $index => $discordItem) {
                    \App\Models\NewsTopSorting::create([
                        'news_id' => $discordItem->id,
                        'news_type' => 'discord',
                        'sort_order' => $startIndex + $index
                    ]);
                }
            });
        }
        
        $topNewsItems = \Illuminate\Support\Facades\DB::table('data.news_top_sorting as nts')
            ->select(
                'nts.news_id',
                'nts.news_type',
                'nts.sort_order',
                'n.slug as news_slug',
                'n.image_url as news_image_url',
                'n.published_at as news_published_at',
                'nt.title as news_title',
                'nt.excerpt as news_excerpt',
                'dtn.title as discord_title',
                'dtn.description as discord_description',
                'dtn.url as discord_url',
                'dtn.source as discord_source',
                'dtn.published_at as discord_published_at'
            )
            ->leftJoin('data.news as n', function($join) {
                $join->on('nts.news_id', '=', 'n.id')
                     ->where('nts.news_type', '=', 'news');
            })
            ->leftJoin('data.news_translations as nt', function($join) {
                $join->on('n.id', '=', 'nt.news_id')
                     ->where('nt.language', '=', 'en'); // Default to English, can be changed based on user preference
            })
            ->leftJoin('data.discord_top_news as dtn', function($join) {
                $join->on('nts.news_id', '=', 'dtn.id')
                     ->where('nts.news_type', '=', 'discord');
            })
            ->orderBy('nts.sort_order')
            ->limit(3) // Limit to top 3 news items
            ->get()
            ->map(function ($item) {
                if ($item->news_type === 'news' && $item->news_title) {
                    return [
                        'id' => $item->news_id,
                        'type' => 'news',
                        'title' => $item->news_title,
                        'description' => $item->news_excerpt ?? '',
                        'source' => 'News',
                        'url' => route('news.show', $item->news_slug),
                        'published_at' => $item->news_published_at,
                        'image_url' => $item->news_image_url,
                    ];
                } elseif ($item->news_type === 'discord' && $item->discord_title) {
                    return [
                        'id' => $item->news_id,
                        'type' => 'discord',
                        'title' => $item->discord_title,
                        'description' => $item->discord_description ?? '',
                        'source' => $item->discord_source ?? 'Discord',
                        'url' => $item->discord_url,
                        'published_at' => $item->discord_published_at,
                        'image_url' => null,
                    ];
                }
                return null;
            })
            ->filter() // Remove null items
            ->values(); // Re-index array

        return $topNewsItems;
    }

    public function index(Request $request)
    {
        $limit = 10;
        $page = max(1, (int) $request->get('page', 1));
        $offset = ($page - 1) * $limit;
        $filterType = $request->get('filterType', 'all');
        $userId = $request->user() ? $request->user()->id : null;
        $searchTerm = $request->get('search', '');
        // Get total stake data
        $stakeData = $this->totalStakeService->getTotalStake();
        $totalStakeLamports = $stakeData[0]->total_network_stake_sol * 1000000000;
        // Fetch validators data using service
        $validators = $this->validatorDataService->fetchDataValidators($userId ?? null, $filterType, $offset, $totalStakeLamports, 'spy_rank', $searchTerm);
        $sortedValidators = $validators['validatorsAllData']->toArray();
        $filteredTotalCount = $validators['totalFilteredValidators'];
        // Get top validators
        $topValidatorsWithRanks = $this->validatorDataService->fetchDataTopValidators($sortedValidators, $totalStakeLamports);

        // Get top news items
        $topNewsItems = $this->getTopNewsItems();
        // Check if user is authenticated and has admin/manager role
        if (!$request->user()) {
            return Inertia::render('Validators/Index', [
                'validatorsData' => $validators['results'],
                'settingsData' => Settings::first(),
                'totalCount' => $filteredTotalCount,
                'currentPage' => $page,
                'filterType' => $filterType,
                'totalStakeData' => $stakeData[0],
                'topValidatorsData' => $topValidatorsWithRanks,
                'topNewsData' => $topNewsItems
            ]);
        } elseif ($request->user()->hasRole('Admin')) {
            return Inertia::render('Validators/Admin/Index', [
                'validatorsData' => $validators['results'],
                'settingsData' => Settings::first(),
                'totalCount' => $filteredTotalCount,
                'currentPage' => $page,
                'filterType' => $filterType,
                'totalStakeData' => $stakeData[0],
                'topValidatorsData' => $topValidatorsWithRanks,
                'topNewsData' => $topNewsItems
            ]);
        } elseif ($request->user()->hasRole('Manager')) {
            return Inertia::render('Validators/Admin/Index', [
                'validatorsData' => $validators['results'],
                'settingsData' => Settings::first(),
                'totalCount' => $filteredTotalCount,
                'currentPage' => $page,
                'filterType' => $filterType,
                'totalStakeData' => $stakeData[0],
                'topValidatorsData' => $topValidatorsWithRanks,
                'topNewsData' => $topNewsItems
            ]);
        } elseif ($request->user()->hasRole('Customer')) {
            $settings = Settings::first();
            $updateInterval = $settings->update_interval;
            $settings2User = Settings2User::where('user_id', $request->user()->id)->first();
            if ($settings2User) {
                $settings = $settings2User;
                $settings->update_interval = $updateInterval;
            }
            return Inertia::render('Validators/Customer/Index', [
                'validatorsData' => $validators['results'],
                'settingsData' => $settings,
                'totalCount' => $filteredTotalCount,
                'currentPage' => $page,
                'filterType' => $filterType,
                'totalStakeData' => $stakeData[0],
                'topValidatorsData' => $topValidatorsWithRanks,
                'topNewsData' => $topNewsItems
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
        
        // Use the search_validators function to get validator data
        $userId = $request->user() ? $request->user()->id : null;
        
        $validatorQuery = "SELECT * FROM data.search_validators(?, 'all', ?, 'spy_rank', 0, 1)";
        $validatorData = DB::select($validatorQuery, [$voteKey, $userId]);
        
        $validatorScores = "SELECT * FROM data.search_validators(?, 'all', ?, 'spy_rank', 0, 1)";
        $validatorScoresData = DB::select($validatorQuery, [$voteKey, $userId]);
        // Get the first (and only) result
        $validatorData = !empty($validatorData) ? $validatorData[0] : null;
        
        // Add slots data from leader_schedule table
        if ($validatorData) {
            $slotsQuery = "SELECT slots FROM data.leader_schedule WHERE node_pubkey = ? AND epoch = ?";
            $slotsData = DB::select($slotsQuery, [$validatorData->node_pubkey, $epoch]);
            $validatorData->slots = !empty($slotsData) ? $slotsData[0]->slots : 0;
            
            // Set spyRank to tvc_rank (same as in ValidatorDataService)
            $validatorData->spyRank = $validatorData->tvc_rank;
            
            // Get validator averages for the last 10 epochs
            try {
                $validatorAveragesService = new ValidatorAveragesService();
                $validatorData->epochAverages = $validatorAveragesService->getValidatorAverages($validatorData->vote_pubkey, 10);
                $validatorData->overallAverages = $validatorAveragesService->getOverallValidatorAverages($validatorData->vote_pubkey, 10);
            } catch (\Exception $e) {
                // If there's an error fetching averages, set empty arrays
                $validatorData->epochAverages = [];
                $validatorData->overallAverages = [
                    'overall_avg_uptime' => 0,
                    'overall_avg_root_slot' => 0,
                    'overall_avg_stake' => 0
                ];
            }
        }
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
    public function adminIndex(Request $request)
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

        // Get top news items
        $topNewsItems = $this->getTopNewsItems();

        return Inertia::render('Validators/Admin/Index', [
            'validatorsData' => $data['validatorsData'],
            'settingsData' => Settings::first(),
            'totalCount' => $data['filteredTotalCount'],
            'currentPage' => $page,
            'filterType' => $filterType,
            'totalStakeData' => $stakeData[0],
            'topValidatorsData' => $topValidatorsWithRanks,
            'topNewsData' => $topNewsItems
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
        $filterType = $request->get('filterType', 'compare');
        $userId = $request->user() ? $request->user()->id : null;
        // For unauthenticated users, get favorite validator IDs from request parameter
        $comparisonIds = null;
        if (!$userId) {
            $comparisonIds = $request->get('ids', $request->input('ids', []));
            if (empty($comparisonIds)) {
                // Try to get from query parameters
                $comparisonIds = $request->query('ids', []);
            }
            if (is_string($comparisonIds)) {
                $comparisonIds = json_decode($comparisonIds, true) ?: [];
            }
        }
        // Get total stake data
        $stakeData = $this->totalStakeService->getTotalStake();
        $totalStakeLamports = $stakeData[0]->total_network_stake_sol * 1000000000;
        // Fetch validators data using service
        // $validators = $this->validatorDataService->fetchDataComparisonsValidators($userId, $filterType, $offset, $totalStakeLamports, $comparisonIds);
        $validators = $this->validatorDataService->fetchDataComparisonsValidators($userId, $filterType, $offset, $totalStakeLamports, $comparisonIds);
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
            // Try to get favorite IDs from different sources
            $favoriteIds = $request->get('ids', $request->input('ids', $request->query('ids', [])));
            if (is_string($favoriteIds)) {
                $favoriteIds = json_decode($favoriteIds, true) ?: [];
            }
            
            // If we still don't have favorite IDs, try to get them from localStorage
            // This is a fallback for cases where the frontend didn't pass them correctly
            if (empty($favoriteIds)) {
                // We can't directly access localStorage from PHP, but we can check if the request
                // contains a special header or cookie that might have been set by JavaScript
                // For now, we'll just leave it as an empty array
                $favoriteIds = [];
            }
        } else {
            $favoriteIds = DB::table('data.validators2users')
                ->where('user_id', $userId)
                ->where('type', 'favorite')
                ->pluck('validator_id')
                ->toArray();
        }
        // Get total stake data
        $stakeData = $this->totalStakeService->getTotalStake();
        $totalStakeLamports = $stakeData[0]->total_network_stake_sol * 1000000000;
        // Fetch validators data using service
        $validators = $this->validatorDataService->fetchDataFavoriteValidators($userId, $filterType, $offset, $totalStakeLamports, $favoriteIds);
        // dd($validators['results']);exit;
        $filteredTotalCount = $validators['totalFilteredValidators'];

        return Inertia::render('Favorites/Index', [
            'validatorsData' => $validators['results'],
            'settingsData' => Settings::first(),
            'totalCount' => $filteredTotalCount,
            'currentPage' => $page,
            'filterType' => $filterType,
            'totalStakeData' => $stakeData[0],
        ]);
    }

    /**
     * Handle bulk actions for admin validators
     */
    public function bulkAction(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'action' => 'required|in:top,highlight,ban,unban,delete',
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer'
        ]);
        
        // Custom validation for validator IDs
        $validIds = DB::table('data.validators')->whereIn('id', $validated['ids'])->pluck('id')->toArray();
        $invalidIds = array_diff($validated['ids'], $validIds);
        
        if (!empty($invalidIds)) {
            return back()->withErrors(['ids' => 'Some validator IDs are invalid: ' . implode(', ', $invalidIds)]);
        }

        $action = $validated['action'];
        $ids = $validated['ids'];
        $count = 0;

        switch ($action) {
            case 'top':
                // Get current is_top status before toggling
                $currentStatuses = DB::table('data.validators')
                    ->select('id', 'is_top')
                    ->whereIn('id', $ids)
                    ->get()
                    ->keyBy('id');
                
                // Toggle top status for validators
                $count = DB::table('data.validators')
                    ->whereIn('id', $ids)
                    ->update(['is_top' => DB::raw('NOT is_top')]);
                
                // Manage validator order entries based on new status
                foreach ($currentStatuses as $validatorId => $validator) {
                    $newIsTop = !$validator->is_top; // This is the new status after toggle
                    
                    if ($newIsTop) {
                        // Add to validator_order table with max sort_order + 1
                        $maxSortOrder = ValidatorOrder::where('list_type', 'top')
                            ->max('sort_order') ?? 0;
                        
                        ValidatorOrder::create([
                            'validator_id' => $validatorId,
                            'sort_order' => $maxSortOrder + 1,
                            'list_type' => 'top'
                        ]);
                    } else {
                        // Remove from validator_order table
                        ValidatorOrder::where('validator_id', $validatorId)
                            ->where('list_type', 'top')
                            ->delete();
                    }
                }
                break;
                
            case 'highlight':
                // Toggle highlight status for validators
                $count = DB::table('data.validators')
                    ->whereIn('id', $ids)
                    ->update(['is_highlighted' => DB::raw('NOT is_highlighted')]);
                break;
                
            case 'ban':
                // Ban validators (implementation depends on how banning is stored)
                $count = DB::table('data.validators')
                    ->whereIn('id', $ids)
                    ->update(['is_banned' => true]);
                break;
                
            case 'unban':
                // Unban validators
                $count = DB::table('data.validators')
                    ->whereIn('id', $ids)
                    ->update(['is_banned' => false]);
                break;
                
            case 'delete':
                // Delete validators (be careful with this action)
                $count = DB::table('data.validators')
                    ->whereIn('id', $ids)
                    ->delete();
                break;
        }

        return redirect()->route('admin.validators.index')
            ->with('success', "Bulk {$action} completed successfully. {$count} validators affected.");
    }

    /**
     * Display admin listing of top validators
     */
    public function adminTopIndex(Request $request): Response
    {
        $data = DB::table('data.validator_order')
            ->leftJoin('data.validators', 'data.validators.id', '=', 'data.validator_order.validator_id')
            ->select('data.validators.id', 'data.validators.name', 'data.validators.avatar_file_url')
            ->orderBy('data.validator_order.sort_order')
            ->get();
        // Get top validators

        return Inertia::render('Validators/Admin/TopIndex', [
            'validatorsData' => $data,
        ]);
    }

    /**
     * Get the average rank from validator scores
     */
    public function getAverageRank(Request $request)
    {
        try {
            $averageRank = DB::table('data.validator_scores')
                ->avg('rank');
            
            return response()->json([
                'average_rank' => $averageRank ? round($averageRank, 2) : 0
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch average rank'], 500);
        }
    }

    
}