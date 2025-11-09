<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Settings;
use App\Models\Settings2User; // Added the correct import
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

    public function getDataWithHeaderByUser(Request $request)
    {
        // Fixed the incomplete line and used the proper model reference
        $user = $request->user();
        $settings2User = Settings2User::where('user_id', $user->id)->first();
        if (!($settings2User)) {
            $settings2User = Settings::first();
        }
        return response()->json([
            'message' => 'Success',
            'data' => $settings2User
        ]);
    }

    public function updateCustomerSettings(Request $request)
    { 
        $user = $request->user();
        $settings2User = Settings2User::where('user_id', $user->id)->first();
        if (!$settings2User) {
            // Check if columns data is already JSON or needs to be encoded
            $columnsData = $request->get('columns');
            $tableFields = is_string($columnsData) ? $columnsData : json_encode($columnsData);
            
            // Use proper parameter binding for INSERT to avoid SQL injection and escaping issues
            // Adding created_at and updated_at fields
            DB::statement('INSERT INTO data.settings2user (table_fields, user_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())', [
                $tableFields,
                $user->id
            ]);
        } else {
            // Check if columns data is already JSON or needs to be encoded
            $columnsData = $request->get('columns');
            $tableFields = is_string($columnsData) ? $columnsData : json_encode($columnsData);
            
            // Use proper parameter binding to avoid escaping issues with backslashes
            DB::statement('UPDATE data.settings2user SET table_fields = ?, updated_at = NOW() WHERE user_id = ?', [
                $tableFields, 
                $user->id
            ]);
        }
        return response()->json([
            'success' => true,
            'message' => 'Success',
        ]);
    }

    public function updateCustomerNoticeSettings(Request $request)
    { 
        $user = $request->user();
        $settings2User = Settings2User::where('user_id', $user->id)->first();
        $columnsData = $request->get('columns');
        if (!$settings2User) {
            // Check if columns data is already JSON or needs to be encoded
            $noticeFields = is_string($columnsData) ? $columnsData : json_encode($columnsData);
            
            // Use proper parameter binding for INSERT to avoid SQL injection and escaping issues
            // Adding created_at and updated_at fields
            DB::statement('INSERT INTO data.settings2user (notice_settings, user_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())', [
                $noticeFields,
                $user->id
            ]);
        } else {
            // Check if columns data is already JSON or needs to be encoded
            $noticeFields = is_string($columnsData) ? $columnsData : json_encode($columnsData);
            
            // Use proper parameter binding to avoid escaping issues with backslashes
            DB::statement('UPDATE data.settings2user SET notice_settings = ?, updated_at = NOW() WHERE user_id = ?', [
                $noticeFields, 
                $user->id
            ]);
        }
        return response()->json([
            'success' => true,
            'message' => 'Success',
        ]);
    }


    public function update(Request $request)
    { 
        // Check if columns data is already JSON or needs to be encoded
        $columnsData = $request->get('columns');
        $tableFields = is_string($columnsData) ? $columnsData : json_encode($columnsData);
        
        // Use proper parameter binding to avoid escaping issues with backslashes
        DB::statement('UPDATE data.settings SET table_fields = ?, updated_at = NOW()', [
            $tableFields
        ]);
        return response()->json([
            'success' => true,
            'message' => 'Success',
        ]);
    }

    public function updateViewMode(Request $request) {
        $user = $request->user();
        $settings2User = Settings2User::where('user_id', $user->id)->first();
        if ($settings2User) {
            $settings2User->view_mode = $request->get('viewMode');
            $settings2User->save();
        }
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

    public function updateDataSettings(Request $request)
    { 
        // Use proper parameter binding to avoid escaping issues
        DB::statement('UPDATE data.settings SET update_interval = ?, updated_at = NOW()', [
            $request->get('update_interval')
        ]);
        
        // Return Inertia response instead of plain JSON
        return Inertia::render('Settings/Admin/Index', [
            'settingsData' => Settings::first(),
        ]);
    }
 
}