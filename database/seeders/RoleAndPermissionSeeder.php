<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;


class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Permission::create(['name' => 'clinic-create']);
        Permission::create(['name' => 'clinic-edit']);

        Permission::create(['name' => 'filial-create']);
        Permission::create(['name' => 'filial-edit']);
        Permission::create(['name' => 'filial-delete']);
        Permission::create(['name' => 'filial-view']);

        Permission::create(['name' => 'customer-create']);
        Permission::create(['name' => 'customer-edit']);
        Permission::create(['name' => 'customer-delete']);
        Permission::create(['name' => 'customer-view']);


        $adminRole = Role::create(['name' => 'Admin']);
        $ceoRole = Role::create(['name' => 'Ceo']);
        $ceoFilialRole = Role::create(['name' => 'Ceo Filial']);
        $adminFilialRole = Role::create(['name' => 'Administrator Filial']);
        $doctorRole = Role::create(['name' => 'Doctor']);
        $sNurseRole = Role::create(['name' => 'Senior nurse']);
        $nurseRole = Role::create(['name' => 'Nurse']);
        $customerRole = Role::create(['name' => 'Customer']);

        $adminRole->givePermissionTo([
            'clinic-create',
            'clinic-edit',
            'customer-create',
            'customer-edit',
            'customer-delete',
            'filial-create',
            'filial-edit',
            'filial-delete',
            'filial-view'
        ]);

        $ceoRole->givePermissionTo([
            'customer-create',
            'customer-edit',
            'customer-delete',
            'filial-create',
            'filial-edit',
            'filial-delete',
            'filial-view'
        ]);

        $ceoFilialRole->givePermissionTo([
            'customer-create',
            'customer-edit',
            'customer-delete',
            'filial-edit',
        ]);
        $adminFilialRole->givePermissionTo([
            'customer-create',
            'customer-edit',
            'customer-delete',
            'filial-edit',
        ]);
//        $doctorRole->givePermissionTo([
//            'customer-create',
//            'customer-edit',
//            'customer-delete',
//            'filial-edit',
//        ]);
    }
}
