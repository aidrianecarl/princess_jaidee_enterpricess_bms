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
            ['name' => 'S', 'description' => 'Small size'],
            ['name' => 'M', 'description' => 'Medium size'],
            ['name' => 'L', 'description' => 'Large size'],
            ['name' => 'XL', 'description' => 'Extra Large'],
            ['name' => 'XXL', 'description' => 'Double Extra Large'],
            ['name' => '3XL', 'description' => 'Triple Extra Large'],
        ];

        foreach ($sizes as $size) {
            Size::create($size);
        }
    }
}
