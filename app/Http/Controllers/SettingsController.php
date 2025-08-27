<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Settings;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    //
    public function getDataWithHeader(Request $request)
    {
        $setting = Settings::first();
//        $headerValue = $setting ? $setting->value : 'default';

        return response()->json([
            'message' => 'Success',
            'data' => $setting
        ]);
    }
}
