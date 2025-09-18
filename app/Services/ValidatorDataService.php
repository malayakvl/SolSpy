<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use App\Services\SpyRankService;
use App\Services\TotalStakeService;
use App\Models\Settings;

class ValidatorDataService
{
    protected $spyRankService;
    protected $totalStakeService;

    public function __construct(SpyRankService $spyRankService, TotalStakeService $totalStakeService)
    {
        $this->spyRankService = $spyRankService;
        $this->totalStakeService = $totalStakeService;
    }

    public function fetchDataValidators($userId, string $filterType, int $offset, $totalStakeLamports)
    {
        $query = DB::table('data.validators')
            ->leftJoin('data.countries', 'data.validators.country', '=', 'data.countries.name');
            
        // Only join favorites table if user is authenticated
        if ($userId) {
            $query->leftJoin('data.validators_favorite', function($join) use ($userId) {
                $join->on('data.validators.id', '=', 'data.validators_favorite.validator_id')
                     ->where('data.validators_favorite.user_id', '=', $userId);
            })
            ->select('data.validators.*', 'data.validators_favorite.id as favorite_id', 'data.countries.iso as country_iso', 'data.countries.iso3 as country_iso3', 'data.countries.phone_code as country_phone_code');
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

        $results = $validatorsData->map(function ($validator) use ($sortedValidators, $totalStakeLamports) {
            // Находим индекс валидатора в отсортированном массиве по vote_pubkey
            $tvcRank = array_search($validator->vote_pubkey, array_column($sortedValidators, 'vote_pubkey')) + 1;
            // Добавляем tvcRank к объекту валидатора
            $validator->tvcRank = $tvcRank ?: 'Not found'; // Если не найден, возвращаем 'Not found'
            // Calculate spyRank
            $validator->spyRank = $this->spyRankService->calculateSpyRank($validator, $totalStakeLamports);
            
            return $validator;
        });
        
        return [
            'sortedValidators' => $sortedValidators,
            'results' => $results,
            'totalCount' => $filteredTotalCount,
            'totalFilteredValidators' => $filteredTotalCount,
            'validatorsData' => $validatorsData,
            'validatorsAllData' => $validatorsAllData
        ];
    }

    public function fetchDataTopValidators($sortedValidators, $totalStakeLamports) {
        //getting top validators
        $topValidators = DB::table('data.validators')
            ->where('data.validators.is_top', true)
            ->orderBy('data.validators.activated_stake', 'DESC')
            ->limit(10)
            ->get();

        // Calculate TVC rank and Spy rank for top validators as well
        $topValidatorsWithRanks = $topValidators->map(function ($validator) use ($sortedValidators, $totalStakeLamports) {
            // Calculate TVC rank
            $tvcRank = array_search($validator->vote_pubkey, array_column($sortedValidators, 'vote_pubkey')) + 1;
            $validator->tvcRank = $tvcRank ?: 'Not found';
            
            // Calculate spyRank
            $validator->spyRank = $this->spyRankService->calculateSpyRank($validator, $totalStakeLamports);
            
            return $validator;
        });

        return $topValidatorsWithRanks;
    }

    public function timeoutData($sortColumn, $sortDirection, $totalStakeLamports, $userId = null, $filterType = 'all', $limit = 10, $offset = 0, $searchTerm = '')
    { 
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
            $query->leftJoin('data.validators_favorite', function($join) use ($userId) {
                $join->on('data.validators.id', '=', 'data.validators_favorite.validator_id')
                     ->where('data.validators_favorite.user_id', '=', $userId);
            })
            ->select('data.validators.*', 'data.validators_favorite.id as favorite_id', 'data.countries.iso as country_iso', 'data.countries.iso3 as country_iso3', 'data.countries.phone_code as country_phone_code');
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

        // Рассчитываем tvcRank и spyRank для каждого валидатора из $validatorsData
        $results = $validatorsData->map(function ($validator) use ($sortedValidators, $totalStakeLamports) {
            // Находим индекс валидатора в отсортированном массиве по vote_pubkey
            $tvcRank = array_search($validator->vote_pubkey, array_column($sortedValidators, 'vote_pubkey')) + 1;

            // Добавляем tvcRank к объекту валидатора
            $validator->tvcRank = $tvcRank ?: 'Not found'; // Если не найден, возвращаем 'Not found'
            
            // Calculate spyRank
            $validator->spyRank = $this->spyRankService->calculateSpyRank($validator, $totalStakeLamports);
            
            return $validator;
        });

        return [
            'validatorsData' => $results,
            'totalCount' => $filteredTotalCount,
            'filteredTotalCount' => $filteredTotalCount,
            'totalStakeLamports' => $totalStakeLamports,
        ];
    }

    public function fetchDataFavoriteValidators($userId, string $filterType, int $offset, $totalStakeLamports, $favoriteIds = null)
    {
        // For authenticated users, use the favorites table
        if ($userId) {
            $query = DB::table('data.validators')
                ->leftJoin('data.countries', 'data.validators.country', '=', 'data.countries.name')
                ->join('data.validators_favorite', function($join) use ($userId) {
                    $join->on('data.validators.id', '=', 'data.validators_favorite.validator_id')
                         ->where('data.validators_favorite.user_id', '=', $userId);
                })
                ->select('data.validators.*', 'data.validators_favorite.id as favorite_id', 'data.countries.iso as country_iso', 'data.countries.iso3 as country_iso3', 'data.countries.phone_code as country_phone_code');

            // Apply filter based on filterType
            if ($filterType === 'highlight') {
                $query = $query->where('data.validators.is_highlighted', true);
            } elseif ($filterType === 'top') {
                $query = $query->where('data.validators.is_top', true);
            }

            $validatorsData = $query
                ->orderBy('data.validators.id')
                ->limit(10)->offset($offset)->get();

            // Calculate total count based on filter
            $totalCountQuery = DB::table('data.validators')
                ->join('data.validators_favorite', function($join) use ($userId) {
                    $join->on('data.validators.id', '=', 'data.validators_favorite.validator_id')
                         ->where('data.validators_favorite.user_id', '=', $userId);
                });
                
            // Apply same filter for count
            if ($filterType === 'highlight') {
                $totalCountQuery = $totalCountQuery->where('data.validators.is_highlighted', true);
            } elseif ($filterType === 'top') {
                $totalCountQuery = $totalCountQuery->where('data.validators.is_top', true);
            }
            
            $filteredTotalCount = $totalCountQuery->count();
        }
        // For unauthenticated users with specific favorite IDs
        elseif (!empty($favoriteIds)) {
            $query = DB::table('data.validators')
                ->leftJoin('data.countries', 'data.validators.country', '=', 'data.countries.name')
                ->select('data.validators.*', 'data.countries.iso as country_iso', 'data.countries.iso3 as country_iso3', 'data.countries.phone_code as country_phone_code')
                ->whereIn('data.validators.id', $favoriteIds);

            // Apply filter based on filterType
            if ($filterType === 'highlight') {
                $query = $query->where('data.validators.is_highlighted', true);
            } elseif ($filterType === 'top') {
                $query = $query->where('data.validators.is_top', true);
            }

            $validatorsData = $query
                ->orderBy('data.validators.id')
                ->limit(10)->offset($offset)->get();

            // Calculate total count based on filter
            $filteredTotalCount = DB::table('data.validators')
                ->whereIn('data.validators.id', $favoriteIds)
                ->count();
        }
        // For unauthenticated users without favorite IDs, return empty results
        else {
            $validatorsData = collect([]); // Empty collection
            $filteredTotalCount = 0;
        }

        $validatorsAllData = DB::table('data.validators')
            ->orderBy('activated_stake', 'DESC')->get();
        $sortedValidators = $validatorsAllData->toArray();  

        $results = $validatorsData->map(function ($validator) use ($sortedValidators, $totalStakeLamports) {
            // Находим индекс валидатора в отсортированном массиве по vote_pubkey
            $tvcRank = array_search($validator->vote_pubkey, array_column($sortedValidators, 'vote_pubkey')) + 1;
            // Добавляем tvcRank к объекту валидатора
            $validator->tvcRank = $tvcRank ?: 'Not found'; // Если не найден, возвращаем 'Not found'
            // Calculate spyRank
            $validator->spyRank = $this->spyRankService->calculateSpyRank($validator, $totalStakeLamports);
            
            return $validator;
        });
        
        return [
            'sortedValidators' => $sortedValidators,
            'results' => $results,
            'totalCount' => $filteredTotalCount,
            'totalFilteredValidators' => $filteredTotalCount,
            'validatorsData' => $validatorsData,
            'validatorsAllData' => $validatorsAllData
        ];
    }


    public function timeoutFavoriteData($sortColumn, $sortDirection, $totalStakeLamports, $userId = null, $filterType = 'all', $limit = 10, $offset = 0, $searchTerm = '', $favoriteIds = null)
    { 
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
        
        // For authenticated users, use the favorites table
        if ($userId) {
            $query = DB::table('data.validators')
                ->leftJoin('data.countries', 'data.validators.country', '=', 'data.countries.name')
                ->join('data.validators_favorite', function($join) use ($userId) {
                    $join->on('data.validators.id', '=', 'data.validators_favorite.validator_id')
                         ->where('data.validators_favorite.user_id', '=', $userId);
                })
                ->select('data.validators.*', 'data.validators_favorite.id as favorite_id', 'data.countries.iso as country_iso', 'data.countries.iso3 as country_iso3', 'data.countries.phone_code as country_phone_code');
                
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
        } 
        // For unauthenticated users with specific favorite IDs
        elseif (!empty($favoriteIds)) {
            $query = DB::table('data.validators')
                ->leftJoin('data.countries', 'data.validators.country', '=', 'data.countries.name')
                ->select('data.validators.*', 'data.countries.iso as country_iso', 'data.countries.iso3 as country_iso3', 'data.countries.phone_code as country_phone_code')
                ->whereIn('data.validators.id', $favoriteIds);
                
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
        }
        // For unauthenticated users without favorite IDs, return empty results
        else {
            $query = DB::table('data.validators')
                ->leftJoin('data.countries', 'data.validators.country', '=', 'data.countries.name')
                ->select('data.validators.*', 'data.countries.iso as country_iso', 'data.countries.iso3 as country_iso3', 'data.countries.phone_code as country_phone_code')
                ->whereRaw('1 = 0'); // Return empty results
        }
        
        // Apply sorting
        if ($sortColumn === 'uptime') {
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
        
        // For authenticated users, use the favorites table
        if ($userId) {
            $totalCountQuery = $totalCountQuery
                ->join('data.validators_favorite', function($join) use ($userId) {
                    $join->on('data.validators.id', '=', 'data.validators_favorite.validator_id')
                         ->where('data.validators_favorite.user_id', '=', $userId);
                });
                
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
        }
        // For unauthenticated users with specific favorite IDs
        elseif (!empty($favoriteIds)) {
            $totalCountQuery = $totalCountQuery->whereIn('data.validators.id', $favoriteIds);
            
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
        }
        // For unauthenticated users without favorite IDs, return zero count
        else {
            $filteredTotalCount = 0;
        }
        
        // Add the hack to filter validators starting from ID 19566 for count as well
        if ($userId || !empty($favoriteIds)) {
            $totalCountQuery = $totalCountQuery->where('data.validators.id', '>=', '19566');
            $filteredTotalCount = $totalCountQuery->count();
        }
        
        $validatorsAllData = DB::table('data.validators')
            ->orderBy('activated_stake', 'DESC')->get();
        $sortedValidators = $validatorsAllData->toArray();

        // Рассчитываем tvcRank и spyRank для каждого валидатора из $validatorsData
        $results = $validatorsData->map(function ($validator) use ($sortedValidators, $totalStakeLamports) {
            // Находим индекс валидатора в отсортированном массиве по vote_pubkey
            $tvcRank = array_search($validator->vote_pubkey, array_column($sortedValidators, 'vote_pubkey')) + 1;

            // Добавляем tvcRank к объекту валидатора
            $validator->tvcRank = $tvcRank ?: 'Not found'; // Если не найден, возвращаем 'Not found'
            
            // Calculate spyRank
            $validator->spyRank = $this->spyRankService->calculateSpyRank($validator, $totalStakeLamports);
            
            return $validator;
        });

        return [
            'validatorsData' => $results,
            'totalCount' => $filteredTotalCount,
            'filteredTotalCount' => $filteredTotalCount,
            'totalStakeLamports' => $totalStakeLamports,
        ];
    }
}