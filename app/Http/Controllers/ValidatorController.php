<?php

namespace App\Http\Controllers;

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
        $validatorsData = DB::table('validators')
            ->where('id', '>=', '574')->orderBy('id')->limit(5)->get();

        return Inertia::render('Validators/Index', [
            'validatorsData' => $validatorsData,
        ]);
    }
}
