<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed countries first as they might be referenced by other tables
        $this->call([
            CountrySeeder::class,
            RoleAndPermissionSeeder::class,
        ]);

        // Users::factory(10)->create();

        User::factory()->create([
            'name' => 'Test Users',
            'email' => 'test@example.com',
        ]);
    }
}
