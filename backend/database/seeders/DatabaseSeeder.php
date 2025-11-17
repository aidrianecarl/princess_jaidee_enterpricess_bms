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

        // Step 4: Create base data (colors, sizes)
        $this->call(ColorsSeeder::class);
        $this->call(SizesSeeder::class);

        // Step 5: Create categories and products
        $this->call(CategorySeeder::class);
        $this->call(ProductsSeeder::class);

        // Step 6: Create services
        $this->call(ServicesSeeder::class);

        // Step 7: Create customers and terms/conditions
        $this->call(CustomerSeeder::class);
        $this->call(TermsConditionsSeeder::class);

        $this->call(QuotationSeeder::class);
        $this->call(QuotationItemSeeder::class);
        $this->call(class: OrderSeeder::class);
        $this->call(OrderItemSeeder::class);
        $this->call(JobOrderSeeder::class);
        $this->call(InventorySeeder::class);

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
