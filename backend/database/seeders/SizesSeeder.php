<?php

namespace Database\Seeders;

use App\Models\Size;
use Illuminate\Database\Seeder;

class SizesSeeder extends Seeder
{
    public function run(): void
    {
        $sizes = [
            ['name' => 'XS', 'description' => 'Extra Small'],
            ['name' => 'Small', 'description' => 'Small size'],
            ['name' => 'Medium', 'description' => 'Medium size'],
            ['name' => 'Large', 'description' => 'Large size'],
            ['name' => 'Extra Large', 'description' => 'Extra Large'],
            ['name' => 'XXL', 'description' => 'Double Extra Large'],
            ['name' => '3XL', 'description' => 'Triple Extra Large'],
        ];

        foreach ($sizes as $size) {
            Size::create($size);
        }
    }
}
