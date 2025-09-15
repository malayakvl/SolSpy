<?php

namespace App\Http\Controllers;

use App\Models\Settings;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

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
        
        $validatorsAllData = DB::table('data.validators')
            ->orderBy('activated_stake', 'DESC')->get();
        $sortedValidators = $validatorsAllData->toArray();

        // Рассчитываем tvcRank для каждого валидатора из $validatorsData
        $results = $validatorsData->map(function ($validator) use ($sortedValidators) {
            // Находим индекс валидатора в отсортированном массиве по vote_pubkey
            $tvcRank = array_search($validator->vote_pubkey, array_column($sortedValidators, 'vote_pubkey')) + 1;

            // Добавляем tvcRank к объекту валидатора
            $validator->tvcRank = $tvcRank ?: 'Not found'; // Если не найден, возвращаем 'Not found'
            return $validator;
        });
        $totalStakeQuery = "
            SELECT COALESCE(SUM(activated_stake) / 1000000000.0, 0) as total_network_stake_sol,
                COUNT(*) as validator_count,
                COUNT(activated_stake) as stake_count
            FROM data.validators
            WHERE activated_stake IS NOT NULL
                AND epoch_credits IS NOT NULL
        ";    
        $totalStake = DB::select($totalStakeQuery)[0];

        //getting top validators
        $topValidators = DB::table('data.validators')
            ->where('data.validators.is_top', true)
            ->orderBy('data.validators.activated_stake', 'DESC')
            ->limit(10)
            ->get();

        if (!$request->user()) {
            return Inertia::render('Validators/Index', [
                'validatorsData' => $results,
                'settingsData' => Settings::first(),
                'totalCount' => $filteredTotalCount,
                'currentPage' => $page,
                'filterType' => $filterType,
                'totalStakeData' => $totalStake,
                'topValidatorsData' => $topValidators
            ]);


        } else {
            return Inertia::render('Validators/Admin/Index', [
                'validatorsData' => $results,
                'settingsData' => Settings::first(),
                'totalCount' => $filteredTotalCount,
                'currentPage' => $page,
                'filterType' => $filterType,
                'totalStakeData' => $totalStake,
                'topValidatorsData' => $topValidators
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
        }else {
            $query->orderBy($dbSortColumn, $actualSortDirection ?? $sortDirection);
        }  
        $query->where('data.validators.id', '>=', '19566');       
        $validatorsData = $query
            // ->orderBy($dbSortColumn, $actualSortDirection ?? $sortDirection)
            ->limit($limit)->offset($offset)->get();

        // Calculate total count with same filter
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
        
        $totalCount = $totalCountQuery->count();

        $validatorsAllData = DB::table('data.validators')
            ->orderBy('activated_stake', 'DESC')->get();
        $sortedValidators = $validatorsAllData->toArray();

        // Рассчитываем tvcRank для каждого валидатора из $validatorsData
        $results = $validatorsData->map(function ($validator) use ($sortedValidators) {
            // Находим индекс валидатора в отсортированном массиве по vote_pubkey
            $tvcRank = array_search($validator->vote_pubkey, array_column($sortedValidators, 'vote_pubkey')) + 1;

            // Добавляем tvcRank к объекту валидатора
            $validator->tvcRank = $tvcRank ?: 'Not found'; // Если не найден, возвращаем 'Not found'
            return $validator;
        });
        return response()->json([
            'validatorsData' => $results,
            'totalCount' => $totalCount,
        ]);
    }

    public function markValidators(Request $request) {
        $checkedIds = $request->get('checkedIds', []);
        $value = $request->get('value');
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
    }

    
    public function comparisons(Request $request) {
        return Inertia::render('Comparisons/Index', [
        ]);
    }

    public function favorites(Request $request) {
        return Inertia::render('Favorites/Index', [
        ]);
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


    public function view($voteKey, Request $request): Response
    {
        $userId = $request->user() ? $request->user()->id : null;
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

        // Рассчитываем tvcRank для каждого валидатора из $validatorsData
        $results = $validatorsData->map(function ($validator) use ($sortedValidators) {
            // Находим индекс валидатора в отсортированном массиве по vote_pubkey
            $tvcRank = array_search($validator->vote_pubkey, array_column($sortedValidators, 'vote_pubkey')) + 1;

            // Добавляем tvcRank к объекту валидатора
            $validator->tvcRank = $tvcRank ?: 'Not found'; // Если не найден, возвращаем 'Not found'
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
