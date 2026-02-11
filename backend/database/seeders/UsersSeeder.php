<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        // Admin User
        $admin = User::create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@princessjaidee.com',
            'password' => Hash::make('Admin@1234'),
            'phone_number' => '+63-975-123-4567',
            'address' => 'Princess Jaidee Main Office',
            'city' => 'Sorsogon City',
            'province' => 'Sorsogon',
            'zip_code' => '4700',
            'user_type' => 'admin',
            'status' => 'active',
        ]);
        $admin->roles()->attach(Role::where('name', 'admin')->first());

        // Manager User
        $manager = User::create([
            'first_name' => 'Juan',
            'last_name' => 'Manager',
            'email' => 'manager@princessjaidee.com',
            'password' => Hash::make('Manager@1234'),
            'phone_number' => '+63-975-123-4568',
            'address' => 'Brgy, Cabid-an',
            'city' => 'Sorsogon City',
            'province' => 'Sorsogon',
            'zip_code' => '4700',
            'user_type' => 'employee',
            'status' => 'active',
        ]);
        $manager->roles()->attach(Role::where('name', 'manager')->first());

        // Cashier User
        $cashier = User::create([
            'first_name' => 'Maria',
            'last_name' => 'Cashier',
            'email' => 'cashier@princessjaidee.com',
            'password' => Hash::make('Cashier@1234'),
            'phone_number' => '+63-975-123-4569',
            'address' => '1st street, Pangpang',
            'city' => 'Sorsogon City',
            'province' => 'Sorsogon',
            'zip_code' => '4700',
            'user_type' => 'employee',
            'status' => 'active',
        ]);
        $cashier->roles()->attach(Role::where('name', 'cashier')->first());

        // Designer User
        $designer = User::create([
            'first_name' => 'Carlos',
            'last_name' => 'Designer',
            'email' => 'designer@princessjaidee.com',
            'password' => Hash::make('Designer@1234'),
            'phone_number' => '+63-975-123-4570',
            'address' => 'Brgy, San Lorenzo',
            'city' => 'Sorsogon',
            'province' => 'Sorsogon City',
            'zip_code' => '4700',
            'user_type' => 'employee',
            'status' => 'active',
        ]);
        $designer->roles()->attach(Role::where('name', 'designer')->first());

        // Client Users
        $clients = [
            [
                'first_name' => 'Cristina',
                'last_name' => 'Santos',
                'email' => 'cristina@client.com',
                'phone_number' => '+63-917-234-5671',
                'address' => '069 Almendras Street, Sorsogon City',
                'city' => 'Sorsogon City',
                'province' => 'Sorsogon',
                'zip_code' => '4700',
            ],
            [
                'first_name' => 'Roberto',
                'last_name' => 'Dela Cruz',
                'email' => 'roberto@client.com',
                'phone_number' => '+63-917-234-5672',
                'address' => '4700 Sports Commplex, Balogo',
                'city' => 'Sorsogon CIty',
                'province' => 'Sorsogon',
                'zip_code' => '4700',
            ],
            [
                'first_name' => 'Angela',
                'last_name' => 'Rivera',
                'email' => 'angela@client.com',
                'phone_number' => '+63-917-234-5673',
                'address' => '15 Street, Pangpang',
                'city' => 'Sorsogon Ccity',
                'province' => 'Sorsogon',
                'zip_code' => '4700',
            ],
        ];

        foreach ($clients as $clientData) {
            $client = User::create([
                ...$clientData,
                'password' => Hash::make('Client@1234'),
                'user_type' => 'client',
                'status' => 'active',
            ]);
            $client->roles()->attach(Role::where('name', 'client')->first());
        }
    }
}
