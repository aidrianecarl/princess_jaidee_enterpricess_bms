<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Customer;
use App\Models\User;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $client1 = User::where('email', 'cristina@client.com')->first();
        $client2 = User::where('email', 'antonio@client.com')->first();
        $client3 = User::where('email', 'luz@client.com')->first();

        if ($client1) {
            Customer::create([
                'user_id' => $client1->id,
                'company_name' => 'Cristina Sports Academy',
                'contact_person' => 'Cristina Reyes',
                'phone_number' => '+63-917-567-8901',
                'email' => 'cristina@client.com',
                'address' => 'Bonifacio Street, Sorsogon',
                'city' => 'Sorsogon',
                'province' => 'Sorsogon',
                'zip_code' => '4700',
                'customer_type' => 'registered',
                'status' => 'active',
            ]);
        }

        if ($client2) {
            Customer::create([
                'user_id' => $client2->id,
                'company_name' => 'Antonio Sports Management',
                'contact_person' => 'Antonio Morales',
                'phone_number' => '+63-917-678-9012',
                'email' => 'antonio@client.com',
                'address' => 'Salcedo Street, Matnog',
                'city' => 'Sorsogon',
                'province' => 'Matnog',
                'zip_code' => '4708',
                'customer_type' => 'registered',
                'status' => 'active',
            ]);
        }

        if ($client3) {
            Customer::create([
                'user_id' => $client3->id,
                'company_name' => 'Luz Athletics',
                'contact_person' => 'Luz Villanueva',
                'phone_number' => '+63-917-789-0123',
                'email' => 'luz@client.com',
                'address' => 'North Reclamation Road, Cebu',
                'city' => 'Cebu',
                'province' => 'Cebu',
                'zip_code' => '6000',
                'customer_type' => 'registered',
                'status' => 'active',
            ]);
        }

        // Walk-in customers (no user account)
        Customer::create([
            'user_id' => null,
            'company_name' => 'Local Basketball Team',
            'contact_person' => 'John Doe',
            'phone_number' => '+63-917-111-2222',
            'email' => 'basketball@walkin.com',
            'address' => 'Sports Complex, Davao',
            'city' => 'Davao',
            'province' => 'Davao del Sur',
            'zip_code' => '8000',
            'customer_type' => 'walk-in',
            'status' => 'active',
        ]);

        Customer::create([
            'user_id' => null,
            'company_name' => 'Youth Football Association',
            'contact_person' => 'Maria Garcia',
            'phone_number' => '+63-917-333-4444',
            'email' => 'football@walkin.com',
            'address' => 'Football Field, Manila',
            'city' => 'Manila',
            'province' => 'Metro Manila',
            'zip_code' => '1205',
            'customer_type' => 'walk-in',
            'status' => 'active',
        ]);
    }
}
