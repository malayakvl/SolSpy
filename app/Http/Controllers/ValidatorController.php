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
        // 18578
        $validatorsData = DB::table('data.validators')
            ->where('id', '>=', '19566')
            ->orWhere('id', '=', '18995')
            ->orderBy('id')->limit(20)->get();
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
            'settingsData' => Settings::first()
        ]);
    }

    public function timeoutData(Request $request)
    {
        // 18578
        $validatorsData = DB::table('data.validators')
            ->where('id', '>=', '19566')
            ->orWhere('id', '=', '18995')
            ->orderBy('id')->limit(10)->get();
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
            $validator->spyRank = 2; // Если не найден, возвращаем 'Not found'
            return $validator;
        });

        return response()->json([
            'validatorsData' => $results
        ]);
    }

}
