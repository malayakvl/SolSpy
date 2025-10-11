<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the appropriate dashboard based on user role.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        if ($user->hasRole('Customer')) {
            return redirect()->route('dashboard.customer');
        } elseif ($user->hasRole('Manager')) {
            return redirect()->route('dashboard.manager');
        } elseif ($user->hasRole(['Admin'])) {
            return redirect()->route('admin.validators.index');
        }
        
        // Default redirect for authenticated users without specific roles
        return redirect()->route('dashboard.customer');
    }
}