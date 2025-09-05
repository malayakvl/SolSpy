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
        
        $validatorsData = $query
            ->where('data.validators.id', '>=', '19566');
            
        // Apply filter based on filterType
        if ($filterType === 'highlight') {
            $validatorsData = $validatorsData->where('data.validators.is_hightlighted', true);
        } elseif ($filterType === 'top') {
            $validatorsData = $validatorsData->where('data.validators.is_top', true);
        }
        
        $validatorsData = $validatorsData
            ->orderBy('data.validators.id')
            ->limit(10)->offset($offset)->get();
            
        // Calculate total count based on filter
        $totalCountQuery = DB::table('data.validators')
            ->where('data.validators.id', '>=', '19566');
            
        // Apply same filter for count
        if ($filterType === 'highlight') {
            $totalCountQuery = $totalCountQuery->where('data.validators.is_hightlighted', true);
        } elseif ($filterType === 'top') {
            $totalCountQuery = $totalCountQuery->where('data.validators.is_top', true);
        }
        
        $filteredTotalCount = $totalCountQuery->count();
        
        $validatorsAllData = DB::table('data.validators')
            ->orderBy('activated_stake')->get();
        $sortedValidators = $validatorsAllData->toArray();
        usort($sortedValidators, function ($a, $b) {
            return (float)$b->activated_stake - (float)$a->activated_stake;
        });

        // Рассчитываем tvcRank для каждого валидатора из $validatorsData
        $results = $validatorsData->map(function ($validator) use ($sortedValidators) {
            // Находим индекс валидатора в отсортированном массиве по vote_pubkey
            $tvcRank = array_search($validator->vote_pubkey, array_column($sortedValidators, 'vote_pubkey')) + 1;

            // Добавляем tvcRank к объекту валидатора
            $validator->tvcRank = $tvcRank ?: 'Not found'; // Если не найден, возвращаем 'Not found'
            return $validator;
        });

        return Inertia::render('Validators/Index', [
            'validatorsData' => $results,
            'settingsData' => Settings::first(),
            'totalCount' => $filteredTotalCount,
            'currentPage' => $page
        ]);
    }

    public function timeoutData(Request $request)
    {
        $page = max(1, (int) $request->get('page', 1)); // Получаем номер страницы с фронтенда, приводим к integer с минимумом 1
        $limit = 10; // Количество записей на страницу
        $offset = ($page - 1) * $limit; // Расчет offset
        $filterType = $request->get('filterType'); // Get filter type
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
        
        // Apply filter based on filterType
        $query->where('data.validators.id', '>=', '19566');
        if ($filterType === 'highlight') {
            $query->where('data.validators.is_hightlighted', true);
        } elseif ($filterType === 'top') {
            $query->where('data.validators.is_top', true);
        }
        
        $validatorsData = $query
            ->orderBy('data.validators.id')
            ->limit($limit)->offset($offset)->get();

        // Calculate total count with same filter
        $totalCountQuery = DB::table('data.validators')
            ->where('data.validators.id', '>=', '19566');
        if ($filterType === 'highlight') {
            $totalCountQuery->where('data.validators.is_hightlighted', true);
        } elseif ($filterType === 'top') {
            $totalCountQuery->where('data.validators.is_top', true);
        }
        $totalCount = $totalCountQuery->count();

        $validatorsAllData = DB::table('data.validators')
            ->orderBy('activated_stake')->get();
        $sortedValidators = $validatorsAllData->toArray();
        usort($sortedValidators, function ($a, $b) {
            return (float)$b->activated_stake - (float)$a->activated_stake;
        });

        $sortedValidators = $validatorsAllData->toArray();
        usort($sortedValidators, function ($a, $b) {
            return (float)$b->activated_stake - (float)$a->activated_stake;
        });

        // Рассчитываем tvcRank для каждого валидатора из $validatorsData
        $results = $validatorsData->map(function ($validator) use ($sortedValidators) {
            // Находим индекс валидатора в отсортированном массиве по vote_pubkey
            $tvcRank = array_search($validator->vote_pubkey, array_column($sortedValidators, 'vote_pubkey')) + 1;

            // Добавляем tvcRank к объекту валидатора
            $validator->tvcRank = $tvcRank ?: 'Not found'; // Если не найден, возвращаем 'Not found'
            $validator->spyRank = 2; // Если не найден, возвращаем 'Not found'
            return $validator;
        });

        return response()->json([
            'validatorsData' => $results,
            'totalCount' => $totalCount,
            'validatorsAllData' => $validatorsAllData
        ]);
    }

    public function markValidators(Request $request) {
        $checkedIds = $request->get('checkedIds', []);
        $value = $request->get('value');
        if (!empty($checkedIds) && in_array($value, ['highlight', 'top'])) {
            // Determine which field to update based on value
            if ($value === 'highlight')
                $field = 'is_hightlighted';
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


    public function view($voteKey, Request $request): Response {

        return Inertia::render('Validators/View', [
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
