<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Color;

class ColorsSeeder extends Seeder
{
    public function run(): void
    {
        $colors = [
            ['name' => 'Red', 'hex_code' => '#DC2626'],
            ['name' => 'Black', 'hex_code' => '#000000'],
            ['name' => 'White', 'hex_code' => '#FFFFFF'],
            ['name' => 'Blue', 'hex_code' => '#3B82F6'],
            ['name' => 'Gold', 'hex_code' => '#FCD34D'],
            ['name' => 'Navy', 'hex_code' => '#001F3F'],
            ['name' => 'Green', 'hex_code' => '#10B981'],
            ['name' => 'Yellow', 'hex_code' => '#FBBF24'],
            ['name' => 'Gray', 'hex_code' => '#6B7280'],
            ['name' => 'Orange', 'hex_code' => '#F97316'],
        ];

        foreach ($colors as $color) {
            Color::create($color);
        }
    }
}
