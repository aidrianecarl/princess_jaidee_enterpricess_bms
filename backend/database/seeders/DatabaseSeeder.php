<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Step 1: Create roles and permissions first
        $this->call(RolesPermissionsSeeder::class);

        // Step 2: Create branches (needed for manager_id foreign key)
        $this->call(BranchSeeder::class);

        // Step 3: Create users (needed for created_by foreign key)
        $this->call(UsersSeeder::class);

        // Step 4: Create services only (products removed from system)
        $this->call(ServicesSeeder::class);

        // Step 5: Create customers and terms/conditions
        $this->call(CustomerSeeder::class);
        $this->call(TermsConditionsSeeder::class);


        $this->command->info('All seeders completed successfully!');
        $this->command->info('');
        $this->command->info('Test Credentials:');
        $this->command->info('Admin: admin@princessjaidee.com / Admin@1234');
        $this->command->info('Manager: manager@princessjaidee.com / Manager@1234');
        $this->command->info('Cashier: cashier@princessjaidee.com / Cashier@1234');
        $this->command->info('Designer: designer@princessjaidee.com / Designer@1234');
        $this->command->info('Client: cristina@client.com / Client@1234');
    }
}
