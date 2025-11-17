<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Branch;

class BranchSeeder extends Seeder
{
    public function run(): void
    {
        Branch::create([
            'name' => 'Davao Headquarters',
            'location' => 'Davao City',
            'address' => 'Quimpo Boulevard, Davao City, Philippines',
            'zip_code' => '8000',
            'phone_number' => '+63-82-123-4567',
            'email' => 'davao@princessjaidee.com',
            'manager_id' => null,
            'is_main_branch' => true,
            'status' => 'active',
        ]);

        Branch::create([
            'name' => 'Manila Branch',
            'location' => 'Manila, NCR',
            'address' => 'Makati City, Manila, Philippines',
            'zip_code' => '1205',
            'phone_number' => '+63-2-8123-4567',
            'email' => 'manila@princessjaidee.com',
            'manager_id' => null,
            'is_main_branch' => false,
            'status' => 'active',
        ]);

        Branch::create([
            'name' => 'Cebu Branch',
            'location' => 'Cebu City',
            'address' => 'Cebu City, Cebu, Philippines',
            'zip_code' => '6000',
            'phone_number' => '+63-32-123-4567',
            'email' => 'cebu@princessjaidee.com',
            'manager_id' => null,
            'is_main_branch' => false,
            'status' => 'active',
        ]);
    }
}
