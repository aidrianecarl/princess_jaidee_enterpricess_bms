<?php

namespace Database\Seeders;

use App\Models\Size;
use Illuminate\Database\Seeder;

class SizesSeeder extends Seeder
{
    public function run(): void
    {
        $sizes = [
            ['name' => 'XS', 'abbreviation' => 'XS'],
            ['name' => 'Small', 'abbreviation' => 'S'],
            ['name' => 'Medium', 'abbreviation' => 'M'],
            ['name' => 'Large', 'abbreviation' => 'L'],
            ['name' => 'Extra Large', 'abbreviation' => 'XL'],
            ['name' => 'XXL', 'abbreviation' => 'XXL'],
            ['name' => '3XL', 'abbreviation' => '3XL'],
        ];

        foreach ($sizes as $size) {
            Size::create($size);
        }
    }
}
