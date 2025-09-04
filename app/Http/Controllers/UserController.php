<?php
namespace App\Http\Controllers;


use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function assignRole(Request $request, $userId)
    {
        $user = User::findOrFail($userId);
        $role = $request->input('role'); // Например, 'admin'
        
        if (Role::where('name', $role)->exists()) {
            $user->assignRole($role);
            return response()->json(['message' => 'Роль успешно назначена']);
        }
        
        return response()->json(['message' => 'Роль не найдена'], 404);
    }
}