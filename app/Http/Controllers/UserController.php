<?php
namespace App\Http\Controllers;


use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::with('roles')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Customers/Index', [
            'users' => $users
        ]);
    }
    
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