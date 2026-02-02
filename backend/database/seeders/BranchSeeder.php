<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Branch;

class BranchSeeder extends Seeder
{
    public function run(): void
    {
        Branch::create([
            'name' => 'Sorsogon Branch',
            'location' => 'Sorsogon City',
            'address' => 'Callenueva Street, Brgy. Polvorista Sorsogon City',
            'zip_code' => '4700',
            'phone_number' => '+63-930-821-8871 ',
            'email' => 'info@princessjaidee.com',
            'manager_id' => null,
            'is_main_branch' => true,
            'status' => 'active',
        ]);

        Branch::create([
            'name' => 'Irosin Branch',
            'location' => 'Irosin Sorsogon',
            'address' => 'San Pedro, Irosin, Sorsogon (near Andoks)',
            'zip_code' => '4707',
            'phone_number' => '+63-991-405-7330',
            'email' => 'manila@princessjaidee.com',
            'manager_id' => null,
            'is_main_branch' => false,
            'status' => 'active',
        ]);
    }
}
