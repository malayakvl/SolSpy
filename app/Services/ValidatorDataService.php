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

    /**
     * Migrate localStorage comparison data to database when user logs in
     */
    public function migrateLocalStorageComparisonData($userId, $comparisonIds)
    {
        if (!$userId || empty($comparisonIds)) {
            return;
        }

        // Get existing comparison records for this user
        $existingComparisons = DB::table('data.validators2users')
            ->where('user_id', $userId)
            ->pluck('validator_id')
            ->toArray();

        // Filter out comparison IDs that already exist in the database
        $newComparisonIds = array_diff($comparisonIds, $existingComparisons);

        // Insert new comparison records
        $insertData = [];
        foreach ($newComparisonIds as $validatorId) {
            $insertData[] = [
                'user_id' => $userId,
                'validator_id' => $validatorId,
                'type' => 'compare',
                'created_at' => now(),
                'updated_at' => now()
            ];
        }

        if (!empty($insertData)) {
            DB::table('data.validators2users')->insert($insertData);
        }
    }

    /**
     * Migrate localStorage favorite data to database when user logs in
     */
    public function migrateLocalStorageFavoriteData($userId, $favoriteIds)
    {
        if (!$userId || empty($favoriteIds)) {
            return;
        }

        // Get existing favorite records for this user
        $existingFavorites = DB::table('data.validators2users')
            ->where('user_id', $userId)
            ->pluck('validator_id')
            ->toArray();

        // Filter out favorite IDs that already exist in the database
        $newFavoriteIds = array_diff($favoriteIds, $existingFavorites);

        // Insert new favorite records
        $insertData = [];
        foreach ($newFavoriteIds as $validatorId) {
            $insertData[] = [
                'user_id' => $userId,
                'validator_id' => $validatorId,
                'type' => 'favorite',
                'created_at' => now(),
                'updated_at' => now()
            ];
        }

        if (!empty($insertData)) {
            DB::table('data.validators2users')->insert($insertData);
        }
    }

    /**
     * Migrate localStorage favorite data to database when user logs in
     */
    public function migrateLocalStorageBlockedData($userId, $blockedIds)
    {
        if (!$userId || empty($blockedIds)) {
            return;
        }

        // Get existing favorite records for this user
        $existingFavorites = DB::table('data.validators2users')
            ->where('user_id', $userId)
            ->pluck('validator_id')
            ->toArray();

        // Filter out favorite IDs that already exist in the database
        $newFavoriteIds = array_diff($blockedIds, $existingFavorites);

        // Insert new favorite records
        $insertData = [];
        foreach ($newFavoriteIds as $validatorId) {
            $insertData[] = [
                'user_id' => $userId,
                'validator_id' => $validatorId,
                'type' => 'blocked',
                'created_at' => now(),
                'updated_at' => now()
            ];
        }

        if (!empty($insertData)) {
            DB::table('data.validators2users')->insert($insertData);
        }
    }

    public function fetchDataValidators($userId, string $filterType, int $offset, $totalStakeLamports, $sortColumn = 'spyRank', $searchTerm = '')
    {
        // Вызов функции PostgreSQL
        // dd("SELECT * FROM data.search_validators('', 'all', 8, 'spy_rank', 0, 10);");
        $query = DB::select("SELECT * FROM data.search_validators('', 'all', 8, 'spy_rank', 0, 10);");

        // Преобразуем результат в коллекцию для дальнейшей обработки
        $validatorsData = collect($query);

        // Подсчет общего количества записей
        $totalCountQuery = DB::table('data.validators');
        if ($filterType === 'highlight') {
            $totalCountQuery->where('is_highlighted', true);
        } elseif ($filterType === 'top') {
            $totalCountQuery->where('is_top', true);
        }
        // if ($searchTerm) {
        //     $totalCountQuery->where(function ($q) use ($searchTerm) {
        //         $q->where('name', 'ILIKE', '%' . $searchTerm . '%')
        //         ->orWhere('vote_pubkey', 'ILIKE', '%' . $searchTerm . '%');
        //     });
        // }
        $filteredTotalCount = $totalCountQuery->count();

        // Дополнительная обработка для spyRank и других вычислений
        $validatorsAllData = DB::table('data.validators')
            ->orderByRaw('tvc_rank DESC NULLS LAST')
            ->get();
        $sortedValidators = $validatorsAllData->toArray();

        $results = $validatorsData->map(function ($validator) use ($sortedValidators, $totalStakeLamports) {
            // tvcRank уже возвращается функцией
            $validator->tvcRank = $validator->tvc_rank ?: 'Not found';

            // Calculate voteScore
            $voteScoreData = DB::select(
                'SELECT AVG(data.validator_scores.rank) as average_rank 
                FROM data.validators 
                LEFT JOIN data.validator_scores ON data.validators.vote_pubkey = data.validator_scores.vote_pubkey
                WHERE data.validators.vote_pubkey = ?',
                [$validator->vote_pubkey]
            );
            $validator->voteScore = !empty($voteScoreData) && $voteScoreData[0]->average_rank 
                ? round($voteScoreData[0]->average_rank, 2) 
                : 0;

            // Calculate spyRank
            $validator->spyRank = $validator->tvcRank;

            // Get latest version
            $latestScore = DB::table('data.validator_scores')
                ->where('vote_pubkey', $validator->vote_pubkey)
                ->orderBy('collected_at', 'desc')
                ->first();
            $validator->latestVersion = $latestScore ? $latestScore->version : null;

            return $validator;
        });

        // Сортировка по spyRank (если нужно)
        if (empty($sortColumn) || $sortColumn === 'spyRank' || $sortColumn === 'spy_rank') {
            $results = $results->sortByDesc(function ($validator) {
                return $validator->spyRank ?? 0;
            })->values();
        }

        return [
            'sortedValidators' => $sortedValidators,
            'results' => $results,
            'totalCount' => $filteredTotalCount,
            'totalFilteredValidators' => $filteredTotalCount,
            'validatorsData' => $results,
            'validatorsAllData' => $validatorsAllData
        ];
    }

    public function fetchDataValidatorsOld($userId, string $filterType, int $offset, $totalStakeLamports, $sortColumn = 'spyRank', $searchTerm = '')
    {
        $query = DB::table('data.validators')
            ->leftJoin('data.countries', 'data.validators.country', '=', 'data.countries.name');
            
        // Only join favorites table if user is authenticated
        if ($userId) {
            $query->leftJoin('data.validators_favorite', function($join) use ($userId) {
                $join->on('data.validators.id', '=', 'data.validators_favorite.validator_id')
                     ->where('data.validators_favorite.user_id', '=', $userId);
            })
            ->select('data.validators.*', 
                'data.validators_favorite.id as is_favorite', 
                'data.countries.iso as country_iso', 
                'data.countries.iso3 as country_iso3', 
                'data.countries.phone_code as country_phone_code')
                ->groupBy(
                    'data.validators.vote_pubkey', 
                    'data.validators.id', 
                    'data.validators_favorite.id',
                    'data.countries.iso', 
                    'data.countries.iso3', 
                    'data.countries.phone_code'
                );
        } else {
            $query->select('data.validators.*', 'data.countries.iso as country_iso', 'data.countries.iso3 as country_iso3', 'data.countries.phone_code as country_phone_code')
                ->groupBy(
                    'data.validators.vote_pubkey', 
                    'data.validators.id', 
                    'data.countries.iso', 
                    'data.countries.iso3', 
                    'data.countries.phone_code'
                );
        }
        
        // Apply filter based on filterType
        if ($filterType === 'highlight') {
            $query = $query->where('data.validators.is_highlighted', true);
        } elseif ($filterType === 'top') {
            $query = $query->where('data.validators.is_top', true);
        }
        if ($searchTerm) {
            $query->where(function ($q) use ($searchTerm) {
                $q->where('validators.name', 'ILIKE', '%' . $searchTerm . '%')
                ->orWhere('validators.vote_pubkey', 'ILIKE', '%' . $searchTerm . '%');
            });
        }

        // For spy_rank sorting, we need all validators to calculate and sort properly
        if (empty($sortColumn) || $sortColumn === 'spyRank' || $sortColumn === 'spy_rank') {
            // Fetch all validators that match the filter criteria (without pagination)
            $allValidatorsData = $query->get();
            
            // Calculate total count based on filter
            $totalCountQuery = DB::table('data.validators');
                
            // Apply same filter for count
            if ($filterType === 'highlight') {
                $totalCountQuery = $totalCountQuery->where('data.validators.is_highlighted', true);
            } elseif ($filterType === 'top') {
                $totalCountQuery = $totalCountQuery->where('data.validators.is_top', true);
            }
            
            $filteredTotalCount = $totalCountQuery->count();

            $validatorsAllData = DB::table('data.validators')
                ->orderByRaw('tvc_rank DESC NULLS LAST')->get();
            // dd($validatorsAllData);exit;    
            $sortedValidators = $validatorsAllData->toArray();
            // $allResults = $sortedValidators;
            // Calculate spyRank for all validators
            $allResults = $allValidatorsData->map(function ($validator) use ($sortedValidators, $totalStakeLamports) {
                // Находим индекс валидатора в отсортированном массиве по vote_pubkey
                $tvcRank = array_search($validator->vote_pubkey, array_column($sortedValidators, 'vote_pubkey')) + 1;
                // Добавляем tvcRank к объекту валидатора
                $validator->tvcRank = $tvcRank ?: 'Not found'; // Если не найден, возвращаем 'Not found'
                
                // Calculate voteScore using direct query
                $voteScoreData = DB::select('SELECT AVG(data.validator_scores.rank) as average_rank 
                    FROM data.validators 
                    LEFT JOIN data.validator_scores ON data.validators.vote_pubkey = data.validator_scores.vote_pubkey
                    WHERE data.validators.vote_pubkey = ?', [$validator->vote_pubkey]);
                $validator->voteScore = !empty($voteScoreData) && $voteScoreData[0]->average_rank ? round($voteScoreData[0]->average_rank, 2) : 0;
                
                // Calculate spyRank
                $validator->spyRank = $validator->tvc_rank;
                
                // Get latest version from validator scores using direct query
                $latestScore = DB::table('data.validator_scores')
                    ->where('vote_pubkey', $validator->vote_pubkey)
                    ->orderBy('collected_at', 'desc')
                    ->first();
                $validator->latestVersion = $latestScore ? $latestScore->version : null;
                
                return $validator;
            });
            
            // Sort all validators by spyRank
            $allResults = $allResults->sortByDesc(function ($validator) {
                return $validator->spyRank ?? 0;
            })->values();
            // Now apply pagination to the sorted results
            $validatorsData = $allResults->slice($offset, 10);
            $results = $validatorsData;
        } else {
            // For other sorting columns, use the original approach with database sorting and pagination
            $validatorsData = $query
                // ->orderBy('data.validators.id')
                ->limit(10)->offset($offset)->get();
            // Calculate total count based on filter
            $totalCountQuery = DB::table('data.validators');
                
            // Apply same filter for count
            if ($filterType === 'highlight') {
                $totalCountQuery = $totalCountQuery->where('data.validators.is_highlighted', true);
            } elseif ($filterType === 'top') {
                $totalCountQuery = $totalCountQuery->where('data.validators.is_top', true);
            }
            
            $filteredTotalCount = $totalCountQuery->count();

            $validatorsAllData = DB::table('data.validators')
                ->orderBy('activated_stake', 'DESC')->get();
            $sortedValidators = $validatorsAllData->toArray();

            $results = $validatorsData->map(function ($validator) use ($sortedValidators, $totalStakeLamports) {
                // Находим индекс валидатора в отсортированном массиве по vote_pubkey
                $tvcRank = array_search($validator->vote_pubkey, array_column($sortedValidators, 'vote_pubkey')) + 1;
                // Добавляем tvcRank к объекту валидатора
                $validator->tvcRank = $tvcRank ?: 'Not found'; // Если не найден, возвращаем 'Not found'
                
                // Calculate voteScore using direct query
                $voteScoreData = DB::select('SELECT AVG(data.validator_scores.rank) as average_rank 
                    FROM data.validators 
                    LEFT JOIN data.validator_scores ON data.validators.vote_pubkey = data.validator_scores.vote_pubkey
                    WHERE data.validators.vote_pubkey = ?', [$validator->vote_pubkey]);
                $validator->voteScore = !empty($voteScoreData) && $voteScoreData[0]->average_rank ? round($voteScoreData[0]->average_rank, 2) : 0;
                
                // Calculate spyRank
                // $validator->spyRank = $this->spyRankService->calculateSpyRank($validator, $totalStakeLamports);
                
                // Calculate average rank using direct query
                $averageRankData = DB::select('SELECT AVG(data.validator_scores.rank) as average_rank 
                    FROM data.validators 
                    LEFT JOIN data.validator_scores ON data.validators.vote_pubkey = data.validator_scores.vote_pubkey
                    WHERE data.validators.vote_pubkey = ?', [$validator->vote_pubkey]);
                $validator->averageRank = !empty($averageRankData) && $averageRankData[0]->average_rank ? round($averageRankData[0]->average_rank, 2) : null;
                
                // Get latest version from validator scores using direct query
                $latestScore = DB::table('data.validator_scores')
                    ->where('vote_pubkey', $validator->vote_pubkey)
                    ->orderBy('collected_at', 'desc')
                    ->first();
                $validator->latestVersion = $latestScore ? $latestScore->version : null;
                
                return $validator;
            });
        }
        
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
            ->join('data.validator_order', 'data.validator_order.validator_id', '=', 'data.validators.id')
            ->where('data.validators.is_top', true)
            ->orderBy('data.validator_order.sort_order', 'ASC')
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
        // For TVC Rank, we need to sort by activated_stake in descending order
        // because higher activated_stake means better (lower) rank
        $actualSortDirection = $sortDirection;
        if ($sortColumn === 'tvc_rank' || $sortColumn === 'id') {
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
            ->select('data.validators.*', 
                'data.validators_favorite.id as is_favorite', 
                'data.countries.iso as country_iso', 
                'data.countries.iso3 as country_iso3', 
                'data.countries.phone_code as country_phone_code')
            ->groupBy(
                'data.validators.vote_pubkey', 
                'data.validators.id', 
                'data.validators_favorite.id',
                'data.countries.iso', 
                'data.countries.iso3', 
                'data.countries.phone_code'
            );
        } else {
            $query->select('data.validators.*', 'data.countries.iso as country_iso', 'data.countries.iso3 as country_iso3', 'data.countries.phone_code as country_phone_code')
            ->groupBy(
                'data.validators.vote_pubkey', 
                'data.validators.id', 
                'data.countries.iso', 
                'data.countries.iso3', 
                'data.countries.phone_code'
            );
        }
        // Apply search filter if provided
        if (!empty($searchTerm)) {
            $query = $query->where('data.validators.name', 'LIKE', '%' . $searchTerm . '%');
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
            // Sort by tvc_rank with NULL values at the end
            // For tvc_rank, higher values are better, so we respect the sortDirection parameter
            // NULL values should still be at the end
            // $query->orderByRaw('data.validators.tvc_rank IS NULL ASC, data.validators.tvc_rank ' . $sortDirection);
            $query->orderByRaw('data.validators.tvc_rank IS NULL ASC, data.validators.tvc_rank DESC');
            // $query->orderBy('id', 'asc');
        }
        // Add the hack to filter validators starting from ID 19566
        // $query = $query->where('data.validators.id', '>=', '19566');
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
        // $totalCountQuery = $totalCountQuery->where('data.validators.id', '>=', '19566');
        
        $filteredTotalCount = $totalCountQuery->count();
        
        $validatorsAllData = DB::table('data.validators')
            ->orderBy('activated_stake', 'DESC')->get();
        $sortedValidators = $validatorsAllData->toArray();

        // Рассчитываем tvcRank и spyRank для каждого валидатора из $validatorsData
        $results = $validatorsData->map(function ($validator) use ($sortedValidators, $totalStakeLamports) {
            // Добавляем tvcRank к объекту валидатора
            // $validator->tvcRank = $tvcRank ?: 'Not found'; // Если не найден, возвращаем 'Not found'
            $validator->spyRank = $validator->tvc_rank; // Если не найден, возвращаем 'Not found'
            
            // Calculate spyRank
            // $validator->spyRank = $this->spyRankService->calculateSpyRank($validator, $totalStakeLamports);
            
            // Calculate average rank using direct query
            // $averageRankData = DB::select('SELECT AVG(data.validator_scores.rank) as average_rank 
            //     FROM data.validators 
            //     LEFT JOIN data.validator_scores ON data.validators.vote_pubkey = data.validator_scores.vote_pubkey
            //     WHERE data.validators.vote_pubkey = ?', [$validator->vote_pubkey]);
            // $validator->averageRank = !empty($averageRankData) && $averageRankData[0]->average_rank ? round($averageRankData[0]->average_rank, 2) : null;
            
            // Get latest version from validator scores using direct query
            $latestScore = DB::table('data.validator_scores')
                ->where('vote_pubkey', $validator->vote_pubkey)
                ->orderBy('collected_at', 'desc')
                ->first();
            $validator->latestVersion = $latestScore ? $latestScore->version : null;
            $validator->uptime = $latestScore ? $latestScore->uptime : null;

            return $validator;
        });
        // Sort by spyRank when no sort column is specified or when sorting by ID or spy_rank
        if (empty($sortColumn) || $sortColumn === 'id' || $sortColumn === 'spyRank' || $sortColumn === 'spy_rank') {
            $results = $results->sortByDesc(function ($validator) {
                return $validator->spyRank ?? 0;
            })->values();
        }
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
        // Calculate spyRank values first to enable sorting
        $validatorsWithSpyRank = $validatorsData->map(function ($validator) use ($sortedValidators, $totalStakeLamports) {
            // Находим индекс валидатора в отсортированном массиве по vote_pubkey
            $tvcRank = array_search($validator->vote_pubkey, array_column($sortedValidators, 'vote_pubkey')) + 1;
            // Добавляем tvcRank к объекту валидатора
            $validator->tvcRank = $tvcRank ?: 'Not found'; // Если не найден, возвращаем 'Not found'
            // Calculate spyRank
            $validator->spyRank = $this->spyRankService->calculateSpyRank($validator, $totalStakeLamports);
            
            // Calculate average rank using direct query
            $averageRankData = DB::select('SELECT AVG(data.validator_scores.rank) as average_rank 
                FROM data.validators 
                LEFT JOIN data.validator_scores ON data.validators.vote_pubkey = data.validator_scores.vote_pubkey
                WHERE data.validators.vote_pubkey = ?', [$validator->vote_pubkey]);
            $validator->averageRank = !empty($averageRankData) && $averageRankData[0]->average_rank ? round($averageRankData[0]->average_rank, 2) : null;
            
            // Get latest version from validator scores using direct query
            $latestScore = DB::table('data.validator_scores')
                ->where('vote_pubkey', $validator->vote_pubkey)
                ->orderBy('created_at', 'desc')
                ->first();
            $validator->latestVersion = $latestScore ? $latestScore->version : null;
            
            return $validator;
        });
        
        // Sort by spyRank when no sort column is specified
        if (empty($sortColumn)) {
            $validatorsWithSpyRank = $validatorsWithSpyRank->sortByDesc(function ($validator) {
                return $validator->spyRank ?? 0;
            })->values();
        }
        
        return [
            'sortedValidators' => $sortedValidators,
            'results' => $validatorsWithSpyRank,
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
            // Determine sort direction - default to DESC (highest first) when empty or 'desc'
            $direction = 'DESC';
            if (!empty($sortDirection) && strtolower($sortDirection) === 'asc') {
                $direction = 'ASC';
            }
            
            // Sort by tvc_rank with NULL values at the end
            // For tvc_rank, higher values are better, so we sort DESC (highest first) to show highest values first
            // NULL values should still be at the end
            $query->orderByRaw('data.validators.tvc_rank IS NULL ASC, data.validators.tvc_rank DESC');
            $query->orderBy('id', 'asc');
        }
        // Add the hack to filter validators starting from ID 19566
        // $query = $query->where('data.validators.id', '>=', '19566');
        
        // For spy_rank sorting, we need all validators to calculate and sort properly
        if ($sortColumn === 'spyRank' || $sortColumn === 'spy_rank') {
            // Fetch all validators that match the filter criteria (without pagination)
            $allValidatorsData = $query->get();
            
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
                // $totalCountQuery = $totalCountQuery->where('data.validators.id', '>=', '19566');
                $filteredTotalCount = $totalCountQuery->count();
            }
            
            $validatorsAllData = DB::table('data.validators')
                ->orderBy('activated_stake', 'DESC')->get();
            $sortedValidators = $validatorsAllData->toArray();

            // Calculate spyRank for all validators
            $allResults = $allValidatorsData->map(function ($validator) use ($sortedValidators, $totalStakeLamports) {
                // Находим индекс валидатора в отсортированном массиве по vote_pubkey
                $tvcRank = array_search($validator->vote_pubkey, array_column($sortedValidators, 'vote_pubkey')) + 1;

                // Добавляем tvcRank к объекту валидатора
                $validator->tvcRank = $tvcRank ?: 'Not found'; // Если не найден, возвращаем 'Not found'
                
                // Calculate voteScore using direct query
                $voteScoreData = DB::select('SELECT AVG(data.validator_scores.rank) as average_rank 
                    FROM data.validators 
                    LEFT JOIN data.validator_scores ON data.validators.vote_pubkey = data.validator_scores.vote_pubkey
                    WHERE data.validators.vote_pubkey = ?', [$validator->vote_pubkey]);
                $validator->voteScore = !empty($voteScoreData) && $voteScoreData[0]->average_rank ? round($voteScoreData[0]->average_rank, 2) : 0;
                
                // Calculate spyRank
                $validator->spyRank = $this->spyRankService->calculateSpyRank($validator, $totalStakeLamports);
                
                // Calculate average rank using direct query
                $averageRankData = DB::select('SELECT AVG(data.validator_scores.rank) as average_rank 
                    FROM data.validators 
                    LEFT JOIN data.validator_scores ON data.validators.vote_pubkey = data.validator_scores.vote_pubkey
                    WHERE data.validators.vote_pubkey = ?', [$validator->vote_pubkey]);
                $validator->averageRank = !empty($averageRankData) && $averageRankData[0]->average_rank ? round($averageRankData[0]->average_rank, 2) : null;
                
                // Get latest version from validator scores using direct query
                $latestScore = DB::table('data.validator_scores')
                    ->where('vote_pubkey', $validator->vote_pubkey)
                    ->orderBy('collected_at', 'desc')
                    ->first();
                $validator->latestVersion = $latestScore ? $latestScore->version : null;
                
                return $validator;
            });
            
            // Sort all validators by spyRank
            $allResults = $allResults->sortByDesc(function ($validator) {
                return $validator->spyRank ?? 0;
            })->values();
            
            // Now apply pagination to the sorted results
            $validatorsData = $allResults->slice($offset, $limit);
            $results = $validatorsData;
        } else {
            // For other sorting columns, use the original approach with database sorting and pagination
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
                // $totalCountQuery = $totalCountQuery->where('data.validators.id', '>=', '19566');
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
                
                // Calculate voteScore using direct query
                $voteScoreData = DB::select('SELECT AVG(data.validator_scores.rank) as average_rank 
                    FROM data.validators 
                    LEFT JOIN data.validator_scores ON data.validators.vote_pubkey = data.validator_scores.vote_pubkey
                    WHERE data.validators.vote_pubkey = ?', [$validator->vote_pubkey]);
                $validator->voteScore = !empty($voteScoreData) && $voteScoreData[0]->average_rank ? round($voteScoreData[0]->average_rank, 2) : 0;
                
                // Calculate spyRank
                $validator->spyRank = $this->spyRankService->calculateSpyRank($validator, $totalStakeLamports);
                
                // Calculate average rank using direct query
                $averageRankData = DB::select('SELECT AVG(data.validator_scores.rank) as average_rank 
                    FROM data.validators 
                    LEFT JOIN data.validator_scores ON data.validators.vote_pubkey = data.validator_scores.vote_pubkey
                    WHERE data.validators.vote_pubkey = ?', [$validator->vote_pubkey]);
                $validator->averageRank = !empty($averageRankData) && $averageRankData[0]->average_rank ? round($averageRankData[0]->average_rank, 2) : null;
                
                // Get latest version from validator scores using direct query
                $latestScore = DB::table('data.validator_scores')
                    ->where('vote_pubkey', $validator->vote_pubkey)
                    ->orderBy('collected_at', 'desc')
                    ->first();
                $validator->latestVersion = $latestScore ? $latestScore->version : null;
                
                return $validator;
            });

        }

        return [
            'validatorsData' => $results,
            'totalCount' => $filteredTotalCount,
            'filteredTotalCount' => $filteredTotalCount,
            'totalStakeLamports' => $totalStakeLamports,
        ];
    }

    public function fetchDataBlockedValidators($userId, string $filterType, int $offset, $totalStakeLamports, $favoriteIds = null)
    {
        // For authenticated users, use the favorites table
        if ($userId) {
            $query = DB::table('data.validators')
                ->leftJoin('data.countries', 'data.validators.country', '=', 'data.countries.name')
                ->join('data.validators_blocked', function($join) use ($userId) {
                    $join->on('data.validators.id', '=', 'data.validators_blocked.validator_id')
                         ->where('data.validators_blocked.user_id', '=', $userId);
                })
                ->select('data.validators.*', 'data.validators_blocked.id as favorite_id', 'data.countries.iso as country_iso', 'data.countries.iso3 as country_iso3', 'data.countries.phone_code as country_phone_code');

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
                ->join('data.validators_blocked', function($join) use ($userId) {
                    $join->on('data.validators.id', '=', 'data.validators_blocked.validator_id')
                         ->where('data.validators_blocked.user_id', '=', $userId);
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
        // Calculate spyRank values first to enable sorting
        $validatorsWithSpyRank = $validatorsData->map(function ($validator) use ($sortedValidators, $totalStakeLamports) {
            // Находим индекс валидатора в отсортированном массиве по vote_pubkey
            $tvcRank = array_search($validator->vote_pubkey, array_column($sortedValidators, 'vote_pubkey')) + 1;
            // Добавляем tvcRank к объекту валидатора
            $validator->tvcRank = $tvcRank ?: 'Not found'; // Если не найден, возвращаем 'Not found'
            // Calculate spyRank
            $validator->spyRank = $this->spyRankService->calculateSpyRank($validator, $totalStakeLamports);
            
            // Calculate average rank using direct query
            $averageRankData = DB::select('SELECT AVG(data.validator_scores.rank) as average_rank 
                FROM data.validators 
                LEFT JOIN data.validator_scores ON data.validators.vote_pubkey = data.validator_scores.vote_pubkey
                WHERE data.validators.vote_pubkey = ?', [$validator->vote_pubkey]);
            $validator->averageRank = !empty($averageRankData) && $averageRankData[0]->average_rank ? round($averageRankData[0]->average_rank, 2) : null;
            
            // Get latest version from validator scores using direct query
            $latestScore = DB::table('data.validator_scores')
                ->where('vote_pubkey', $validator->vote_pubkey)
                ->orderBy('created_at', 'desc')
                ->first();
            $validator->latestVersion = $latestScore ? $latestScore->version : null;
            
            return $validator;
        });
        
        // Sort by spyRank when no sort column is specified
        if (empty($sortColumn)) {
            $validatorsWithSpyRank = $validatorsWithSpyRank->sortByDesc(function ($validator) {
                return $validator->spyRank ?? 0;
            })->values();
        }
        
        return [
            'sortedValidators' => $sortedValidators,
            'results' => $validatorsWithSpyRank,
            'totalCount' => $filteredTotalCount,
            'totalFilteredValidators' => $filteredTotalCount,
            'validatorsData' => $validatorsData,
            'validatorsAllData' => $validatorsAllData
        ];
    }

    public function timeoutBlockedData($sortColumn, $sortDirection, $totalStakeLamports, $userId = null, $filterType = 'all', $limit = 10, $offset = 0, $searchTerm = '', $blockedIds = null)
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
        // For authenticated users, use the blocked table
        if ($userId) {
            $query = DB::table('data.validators')
                ->leftJoin('data.countries', 'data.validators.country', '=', 'data.countries.name')
                ->join('data.validators_blocked', function($join) use ($userId) {
                    $join->on('data.validators.id', '=', 'data.validators_blocked.validator_id')
                         ->where('data.validators_blocked.user_id', '=', $userId);
                })
                ->select('data.validators.*', 'data.validators_blocked.id as favorite_id', 'data.countries.iso as country_iso', 'data.countries.iso3 as country_iso3', 'data.countries.phone_code as country_phone_code');
                
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
        elseif (!empty($blockedIds)) {
            $query = DB::table('data.validators')
                ->leftJoin('data.countries', 'data.validators.country', '=', 'data.countries.name')
                ->select('data.validators.*', 'data.countries.iso as country_iso', 'data.countries.iso3 as country_iso3', 'data.countries.phone_code as country_phone_code')
                ->whereIn('data.validators.id', $blockedIds);
                
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
            // Determine sort direction - default to DESC (highest first) when empty or 'desc'
            $direction = 'DESC';
            if (!empty($sortDirection) && strtolower($sortDirection) === 'asc') {
                $direction = 'ASC';
            }
            
            // Sort by tvc_rank with NULL values at the end
            // For tvc_rank, higher values are better, so we sort DESC (highest first) to show highest values first
            // NULL values should still be at the end
            $query->orderByRaw('data.validators.tvc_rank IS NULL ASC, data.validators.tvc_rank DESC');
            $query->orderBy('id', 'asc');
        }
        // Add the hack to filter validators starting from ID 19566
        // $query = $query->where('data.validators.id', '>=', '19566');
        // For spy_rank sorting, we need all validators to calculate and sort properly
        if ($sortColumn === 'spyRank' || $sortColumn === 'spy_rank') {
            // Fetch all validators that match the filter criteria (without pagination)
            $allValidatorsData = $query->get();
            
            // Calculate total count based on filter
            $totalCountQuery = DB::table('data.validators');
            
            // For authenticated users, use the favorites table
            if ($userId) {
                $totalCountQuery = $totalCountQuery
                    ->join('data.validators_blocked', function($join) use ($userId) {
                        $join->on('data.validators.id', '=', 'data.validators_blocked.validator_id')
                             ->where('data.validators_blocked.user_id', '=', $userId);
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
                // $totalCountQuery = $totalCountQuery->where('data.validators.id', '>=', '19566');
                $filteredTotalCount = $totalCountQuery->count();
            }
            
            $validatorsAllData = DB::table('data.validators')
                ->orderBy('activated_stake', 'DESC')->get();
            $sortedValidators = $validatorsAllData->toArray();

            // Calculate spyRank for all validators
            $allResults = $allValidatorsData->map(function ($validator) use ($sortedValidators, $totalStakeLamports) {
                // Находим индекс валидатора в отсортированном массиве по vote_pubkey
                $tvcRank = array_search($validator->vote_pubkey, array_column($sortedValidators, 'vote_pubkey')) + 1;

                // Добавляем tvcRank к объекту валидатора
                $validator->tvcRank = $tvcRank ?: 'Not found'; // Если не найден, возвращаем 'Not found'
                
                // Calculate voteScore using direct query
                $voteScoreData = DB::select('SELECT AVG(data.validator_scores.rank) as average_rank 
                    FROM data.validators 
                    LEFT JOIN data.validator_scores ON data.validators.vote_pubkey = data.validator_scores.vote_pubkey
                    WHERE data.validators.vote_pubkey = ?', [$validator->vote_pubkey]);
                $validator->voteScore = !empty($voteScoreData) && $voteScoreData[0]->average_rank ? round($voteScoreData[0]->average_rank, 2) : 0;
                
                // Calculate spyRank
                $validator->spyRank = $this->spyRankService->calculateSpyRank($validator, $totalStakeLamports);
                
                // Calculate average rank using direct query
                $averageRankData = DB::select('SELECT AVG(data.validator_scores.rank) as average_rank 
                    FROM data.validators 
                    LEFT JOIN data.validator_scores ON data.validators.vote_pubkey = data.validator_scores.vote_pubkey
                    WHERE data.validators.vote_pubkey = ?', [$validator->vote_pubkey]);
                $validator->averageRank = !empty($averageRankData) && $averageRankData[0]->average_rank ? round($averageRankData[0]->average_rank, 2) : null;
                
                // Get latest version from validator scores using direct query
                $latestScore = DB::table('data.validator_scores')
                    ->where('vote_pubkey', $validator->vote_pubkey)
                    ->orderBy('collected_at', 'desc')
                    ->first();
                $validator->latestVersion = $latestScore ? $latestScore->version : null;
                
                return $validator;
            });
            
            // Sort all validators by spyRank
            $allResults = $allResults->sortByDesc(function ($validator) {
                return $validator->spyRank ?? 0;
            })->values();
            // Now apply pagination to the sorted results
            $validatorsData = $allResults->slice($offset, $limit);
            $results = $validatorsData;
        } else {
            // For other sorting columns, use the original approach with database sorting and pagination
            $validatorsData = $query
                ->limit($limit)->offset($offset)->get();

            // Calculate total count based on filter
            $totalCountQuery = DB::table('data.validators');
            
            // For authenticated users, use the favorites table
            if ($userId) {
                $totalCountQuery = $totalCountQuery
                    ->join('data.validators_blocked', function($join) use ($userId) {
                        $join->on('data.validators.id', '=', 'data.validators_blocked.validator_id')
                             ->where('data.validators_blocked.user_id', '=', $userId);
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
                // $totalCountQuery = $totalCountQuery->where('data.validators.id', '>=', '19566');
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
                
                // Calculate voteScore using direct query
                $voteScoreData = DB::select('SELECT AVG(data.validator_scores.rank) as average_rank 
                    FROM data.validators 
                    LEFT JOIN data.validator_scores ON data.validators.vote_pubkey = data.validator_scores.vote_pubkey
                    WHERE data.validators.vote_pubkey = ?', [$validator->vote_pubkey]);
                $validator->voteScore = !empty($voteScoreData) && $voteScoreData[0]->average_rank ? round($voteScoreData[0]->average_rank, 2) : 0;
                
                // Calculate spyRank
                $validator->spyRank = $this->spyRankService->calculateSpyRank($validator, $totalStakeLamports);
                
                // Calculate average rank using direct query
                $averageRankData = DB::select('SELECT AVG(data.validator_scores.rank) as average_rank 
                    FROM data.validators 
                    LEFT JOIN data.validator_scores ON data.validators.vote_pubkey = data.validator_scores.vote_pubkey
                    WHERE data.validators.vote_pubkey = ?', [$validator->vote_pubkey]);
                $validator->averageRank = !empty($averageRankData) && $averageRankData[0]->average_rank ? round($averageRankData[0]->average_rank, 2) : null;
                
                // Get latest version from validator scores using direct query
                $latestScore = DB::table('data.validator_scores')
                    ->where('vote_pubkey', $validator->vote_pubkey)
                    ->orderBy('collected_at', 'desc')
                    ->first();
                $validator->latestVersion = $latestScore ? $latestScore->version : null;
                
                return $validator;
            });

        }

        return [
            'validatorsData' => $results,
            'totalCount' => $filteredTotalCount,
            'filteredTotalCount' => $filteredTotalCount,
            'totalStakeLamports' => $totalStakeLamports,
        ];
    }

    public function fetchDataComparisonsValidators($userId, string $filterType, int $offset, $totalStakeLamports, $comparisonIds = null)
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
                ->join('data.validators_comparison', function($join) use ($userId) {
                    $join->on('data.validators.id', '=', 'data.validators_comparison.validator_id')
                         ->where('data.validators_comparison.user_id', '=', $userId);
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
        elseif (!empty($comparisonIds)) {
            $query = DB::table('data.validators')
                ->leftJoin('data.countries', 'data.validators.country', '=', 'data.countries.name')
                ->select('data.validators.*', 'data.countries.iso as country_iso', 'data.countries.iso3 as country_iso3', 'data.countries.phone_code as country_phone_code')
                ->whereIn('data.validators.id', $comparisonIds);

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
                ->whereIn('data.validators.id', $comparisonIds)
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
            
            // Calculate voteScore using direct query
            $voteScoreData = DB::select('SELECT AVG(data.validator_scores.rank) as average_rank 
                FROM data.validators 
                LEFT JOIN data.validator_scores ON data.validators.vote_pubkey = data.validator_scores.vote_pubkey
                WHERE data.validators.vote_pubkey = ?', [$validator->vote_pubkey]);
            $validator->voteScore = !empty($voteScoreData) && $voteScoreData[0]->average_rank ? round($voteScoreData[0]->average_rank, 2) : 0;
            
            // Calculate spyRank
            $validator->spyRank = $this->spyRankService->calculateSpyRank($validator, $totalStakeLamports);
            
            // Calculate average rank using direct query
            $averageRankData = DB::select('SELECT AVG(data.validator_scores.rank) as average_rank 
                FROM data.validators 
                LEFT JOIN data.validator_scores ON data.validators.vote_pubkey = data.validator_scores.vote_pubkey
                WHERE data.validators.vote_pubkey = ?', [$validator->vote_pubkey]);
            $validator->averageRank = !empty($averageRankData) && $averageRankData[0]->average_rank ? round($averageRankData[0]->average_rank, 2) : null;
            
            // Get latest version from validator scores using direct query
            $latestScore = DB::table('data.validator_scores')
                ->where('vote_pubkey', $validator->vote_pubkey)
                ->orderBy('collected_at', 'desc')
                ->first();
            $validator->latestVersion = $latestScore ? $latestScore->version : null;
            
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

    public function timeoutCompareData($sortColumn, $sortDirection, $totalStakeLamports, $userId = null, $filterType = 'all', $limit = 10, $offset = 0, $searchTerm = '', $compareIds = null)
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
                ->join('data.validators_comparison', function($join) use ($userId) {
                    $join->on('data.validators.id', '=', 'data.validators_comparison.validator_id')
                         ->where('data.validators_comparison.user_id', '=', $userId);
                })
                ->select('data.validators.*', 'data.validators_comparison.id as favorite_id', 'data.countries.iso as country_iso', 'data.countries.iso3 as country_iso3', 'data.countries.phone_code as country_phone_code');
                
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
        elseif (!empty($compareIds)) {
            $query = DB::table('data.validators')
                ->leftJoin('data.countries', 'data.validators.country', '=', 'data.countries.name')
                ->select('data.validators.*', 'data.countries.iso as country_iso', 'data.countries.iso3 as country_iso3', 'data.countries.phone_code as country_phone_code')
                ->whereIn('data.validators.id', $compareIds);
                
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
            // Sort by tvc_rank with NULL values at the end
            $query->orderByRaw('data.validators.tvc_rank IS NULL ASC, data.validators.tvc_rank DESC');
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
        } elseif ($sortColumn === 'spyRank' || $sortColumn === 'spy_rank') {
            // For spy_rank sorting, we need to fetch all validators, calculate spyRank for all, 
            // sort them by spyRank, and then apply pagination
            // This is handled after the query
        } else {
            // Set default sort direction to DESC (highest first) when empty or 'desc'
            $direction = 'DESC';
            if (!empty($sortDirection) && strtolower($sortDirection) === 'asc') {
                $direction = 'ASC';
            }
            
            // Sort by tvc_rank with NULL values at the end
            // For tvc_rank, higher values are better, so we sort DESC to show highest values first
            // NULL values should still be at the end
            $query->orderByRaw('data.validators.tvc_rank IS NULL ASC, data.validators.tvc_rank DESC');
        }
        // Add the hack to filter validators starting from ID 19566
        // $query = $query->where('data.validators.id', '>=', '19566');
        // For spy_rank sorting, we need all validators to calculate and sort properly
        if ($sortColumn === 'spyRank' || $sortColumn === 'spy_rank') {
            // Fetch all validators that match the filter criteria (without pagination)
            $allValidatorsData = $query->get();
            
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
            if ($userId || !empty($compareIds)) {
                // $totalCountQuery = $totalCountQuery->where('data.validators.id', '>=', '19566');
                $filteredTotalCount = $totalCountQuery->count();
            }

            $validatorsAllData = DB::table('data.validators')
                ->orderBy('activated_stake', 'DESC')->get();
            $sortedValidators = $validatorsAllData->toArray();

            // Calculate spyRank for all validators
            $allResults = $allValidatorsData->map(function ($validator) use ($sortedValidators, $totalStakeLamports) {
                // Находим индекс валидатора в отсортированном массиве по vote_pubkey
                $tvcRank = array_search($validator->vote_pubkey, array_column($sortedValidators, 'vote_pubkey')) + 1;

                // Добавляем tvcRank к объекту валидатора
                $validator->tvcRank = $tvcRank ?: 'Not found'; // Если не найден, возвращаем 'Not found'
                
                // Calculate voteScore using direct query
                $voteScoreData = DB::select('SELECT AVG(data.validator_scores.rank) as average_rank 
                    FROM data.validators 
                    LEFT JOIN data.validator_scores ON data.validators.vote_pubkey = data.validator_scores.vote_pubkey
                    WHERE data.validators.vote_pubkey = ?', [$validator->vote_pubkey]);
                $validator->voteScore = !empty($voteScoreData) && $voteScoreData[0]->average_rank ? round($voteScoreData[0]->average_rank, 2) : 0;
                
                // Calculate spyRank
                $validator->spyRank = $this->spyRankService->calculateSpyRank($validator, $totalStakeLamports);
                
                // Calculate average rank using direct query
                $averageRankData = DB::select('SELECT AVG(data.validator_scores.rank) as average_rank 
                    FROM data.validators 
                    LEFT JOIN data.validator_scores ON data.validators.vote_pubkey = data.validator_scores.vote_pubkey
                    WHERE data.validators.vote_pubkey = ?', [$validator->vote_pubkey]);
                $validator->averageRank = !empty($averageRankData) && $averageRankData[0]->average_rank ? round($averageRankData[0]->average_rank, 2) : null;
                
                // Get latest version from validator scores using direct query
                $latestScore = DB::table('data.validator_scores')
                    ->where('vote_pubkey', $validator->vote_pubkey)
                    ->orderBy('collected_at', 'desc')
                    ->first();
                $validator->latestVersion = $latestScore ? $latestScore->version : null;
                
                return $validator;
            });
            
            // Sort all validators by spyRank
            $allResults = $allResults->sortByDesc(function ($validator) {
                return $validator->spyRank ?? 0;
            })->values();
            
            // Now apply pagination to the sorted results
            $validatorsData = $allResults->slice($offset, $limit);
            $results = $validatorsData;
        } else {
            // For other sorting columns, use the original approach with database sorting and pagination
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
            if ($userId || !empty($compareIds)) {
                // $totalCountQuery = $totalCountQuery->where('data.validators.id', '>=', '19566');
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
                
                // Calculate voteScore using direct query
                $voteScoreData = DB::select('SELECT AVG(data.validator_scores.rank) as average_rank 
                    FROM data.validators 
                    LEFT JOIN data.validator_scores ON data.validators.vote_pubkey = data.validator_scores.vote_pubkey
                    WHERE data.validators.vote_pubkey = ?', [$validator->vote_pubkey]);
                $validator->voteScore = !empty($voteScoreData) && $voteScoreData[0]->average_rank ? round($voteScoreData[0]->average_rank, 2) : 0;
                
                // Calculate spyRank
                $validator->spyRank = $this->spyRankService->calculateSpyRank($validator, $totalStakeLamports);
                
                // Calculate average rank using direct query
                $averageRankData = DB::select('SELECT AVG(data.validator_scores.rank) as average_rank 
                    FROM data.validators 
                    LEFT JOIN data.validator_scores ON data.validators.vote_pubkey = data.validator_scores.vote_pubkey
                    WHERE data.validators.vote_pubkey = ?', [$validator->vote_pubkey]);
                $validator->averageRank = !empty($averageRankData) && $averageRankData[0]->average_rank ? round($averageRankData[0]->average_rank, 2) : null;
                
                // Get latest version from validator scores using direct query
                $latestScore = DB::table('data.validator_scores')
                    ->where('vote_pubkey', $validator->vote_pubkey)
                    ->orderBy('collected_at', 'desc')
                    ->first();
                $validator->latestVersion = $latestScore ? $latestScore->version : null;
                
                return $validator;
            });

        }

        return [
            'validatorsData' => $results,
            'totalCount' => $filteredTotalCount,
            'filteredTotalCount' => $filteredTotalCount,
            'totalStakeLamports' => $totalStakeLamports,
        ];
    }
}