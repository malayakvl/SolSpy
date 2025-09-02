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
    public function index(Request $request, $page = 1): Response
    {
        $limit = 10; // Количество записей на страницу
        $offset = ($page - 1) * $limit; // Расчет offset
        $userId = $request->user() ? $request->user()->id : null;
        $validatorsData = DB::table('data.validators')
            ->leftJoin('data.favorites', function($join) use ($userId) {
                $join->on('data.validators.id', '=', 'data.favorites.validator_id')
                     ->where('data.favorites.user_id', '=', $userId);
            })
            ->select('data.validators.*', 'data.favorites.id as favorite_id')
            ->where('data.validators.id', '>=', '19566')
            ->orderBy('data.validators.id')
            ->limit(10)->offset($offset)->get();

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
            'totalCount' => $validatorsAllData->count(),
            'currentPage' => $page
        ]);
    }

    public function timeoutData(Request $request)
    {
        $page = $request->get('page'); // Получаем номер страницы с фронтенда, по умолчанию 1
        $limit = 10; // Количество записей на страницу
        $offset = ($page - 1) * $limit; // Расчет offset
        $userId = $request->user() ? $request->user()->id : null;

        $validatorsData = DB::table('data.validators')
            ->leftJoin('data.favorites', function($join) use ($userId) {
                $join->on('data.validators.id', '=', 'data.favorites.validator_id')
                     ->where('data.favorites.user_id', '=', $userId);
            })
            ->select('data.validators.*', 'data.favorites.id as favorite_id')
            // ->where('data.validators.id', '>=', '19566')
            ->orderBy('data.validators.id')
            ->limit(10)->offset($offset)->get();

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
            'validatorsAllData' => $validatorsAllData
        ]);
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
        
        $query = DB::table('data.validators');
        
        // Only join favorites table if user is authenticated
        if ($userId) {
            $query->leftJoin('data.favorites', function($join) use ($userId) {
                $join->on('data.validators.id', '=', 'data.favorites.validator_id')
                     ->where('data.favorites.user_id', '=', $userId);
            })
            ->select('data.validators.*', 'data.favorites.id as favorite_id');
        } else {
            $query->select('data.validators.*');
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
    }

}
