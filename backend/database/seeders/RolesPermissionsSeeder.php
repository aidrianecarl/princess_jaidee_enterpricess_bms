<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;

class RolesPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Create Permissions
        $permissions = [
            // User Management
            ['name' => 'view_users', 'module' => 'users', 'description' => 'View users'],
            ['name' => 'create_users', 'module' => 'users', 'description' => 'Create users'],
            ['name' => 'edit_users', 'module' => 'users', 'description' => 'Edit users'],
            ['name' => 'delete_users', 'module' => 'users', 'description' => 'Delete users'],

            // Product Management
            ['name' => 'view_products', 'module' => 'products', 'description' => 'View products'],
            ['name' => 'create_products', 'module' => 'products', 'description' => 'Create products'],
            ['name' => 'edit_products', 'module' => 'products', 'description' => 'Edit products'],
            ['name' => 'delete_products', 'module' => 'products', 'description' => 'Delete products'],

            // Service Management
            ['name' => 'view_services', 'module' => 'services', 'description' => 'View services'],
            ['name' => 'create_services', 'module' => 'services', 'description' => 'Create services'],
            ['name' => 'edit_services', 'module' => 'services', 'description' => 'Edit services'],
            ['name' => 'delete_services', 'module' => 'services', 'description' => 'Delete services'],

            // Quotations
            ['name' => 'view_quotations', 'module' => 'quotations', 'description' => 'View quotations'],
            ['name' => 'create_quotations', 'module' => 'quotations', 'description' => 'Create quotations'],
            ['name' => 'edit_quotations', 'module' => 'quotations', 'description' => 'Edit quotations'],
            ['name' => 'approve_quotations', 'module' => 'quotations', 'description' => 'Approve quotations'],

            // Sales/Orders
            ['name' => 'view_orders', 'module' => 'orders', 'description' => 'View orders'],
            ['name' => 'create_orders', 'module' => 'orders', 'description' => 'Create orders'],
            ['name' => 'edit_orders', 'module' => 'orders', 'description' => 'Edit orders'],
            ['name' => 'manage_payments', 'module' => 'orders', 'description' => 'Manage payments'],

            // Job Orders
            ['name' => 'view_job_orders', 'module' => 'job_orders', 'description' => 'View job orders'],
            ['name' => 'create_job_orders', 'module' => 'job_orders', 'description' => 'Create job orders'],
            ['name' => 'edit_job_orders', 'module' => 'job_orders', 'description' => 'Edit job orders'],

            // Reports
            ['name' => 'view_reports', 'module' => 'reports', 'description' => 'View reports'],
            ['name' => 'export_reports', 'module' => 'reports', 'description' => 'Export reports'],

            // Admin
            ['name' => 'manage_roles', 'module' => 'admin', 'description' => 'Manage roles and permissions'],
            ['name' => 'manage_branches', 'module' => 'admin', 'description' => 'Manage branches'],
            ['name' => 'view_activity_logs', 'module' => 'admin', 'description' => 'View activity logs'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate($permission);
        }

        // Create Roles
        $admin = Role::firstOrCreate(['name' => 'admin'], ['description' => 'Administrator with full access']);
        $manager = Role::firstOrCreate(['name' => 'manager'], ['description' => 'Manager with limited admin access']);
        $cashier = Role::firstOrCreate(['name' => 'cashier'], ['description' => 'Cashier for sales transactions']);
        $designer = Role::firstOrCreate(['name' => 'designer'], ['description' => 'Designer for job orders']);
        $client = Role::firstOrCreate(['name' => 'client'], ['description' => 'Client with quotation access']);

        // Assign all permissions to admin
        $admin->permissions()->sync(Permission::pluck('id'));

        // Assign manager permissions
        $managerPermissions = Permission::whereIn('module', ['users', 'products', 'services', 'quotations', 'orders', 'job_orders', 'reports'])
            ->pluck('id');
        $manager->permissions()->sync($managerPermissions);

        // Assign cashier permissions
        $cashierPermissions = Permission::whereIn('name', [
            'view_orders', 'create_orders', 'edit_orders', 'manage_payments',
            'view_quotations', 'create_quotations'
        ])->pluck('id');
        $cashier->permissions()->sync($cashierPermissions);

        // Assign designer permissions
        $designerPermissions = Permission::whereIn('name', [
            'view_job_orders', 'edit_job_orders', 'view_products', 'view_services'
        ])->pluck('id');
        $designer->permissions()->sync($designerPermissions);

        // Assign client permissions
        $clientPermissions = Permission::whereIn('name', [
            'view_quotations'
        ])->pluck('id');
        $client->permissions()->sync($clientPermissions);
    }
}
