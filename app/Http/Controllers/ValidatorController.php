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

        $validatorsData = DB::table('data.validators')
            ->where('id', '>=', '19566')
            ->orderBy('id')
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

        $validatorsData = DB::table('data.validators')
            ->where('id', '>=', '19566')
            ->orderBy('id')
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


    public function view($voteKey, Request $request): Response {

        return Inertia::render('Validators/View', [
        ]);
    }

}
