<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Settings;
use Google\Service\Calendar\Setting;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    //
    public function getDataWithHeader(Request $request)
    {
        $setting = Settings::first();

        return response()->json([
            'message' => 'Success',
            'data' => $setting
        ]);
    }


    public function update(Request $request)
    { 
        DB::select('UPDATE data.settings SET table_fields = \'' . json_encode($request->get('columns')). '\'');
        return response()->json([
            'success' => true,
            'message' => 'Success',
        ]);
    }

    public function adminIndex(Request $request)
    {
        $setting = Settings::first();

        return Inertia::render('Settings/Admin/Index', [
            'settingsData' => Settings::first(),
        ]);
    }
}
