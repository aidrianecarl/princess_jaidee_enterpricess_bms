<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\User;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@princessjaidee.com')->first();

        if (!$admin) {
            return;
        }

        $categories = [
            ['name' => 'Sports Jerseys', 'description' => 'High-quality sports jerseys for teams and clubs', 'status' => 'active'],
            ['name' => 'Athletic Wear', 'description' => 'Performance-driven athletic apparel', 'status' => 'active'],
            ['name' => 'Team Uniforms', 'description' => 'Professional team uniforms and kits', 'status' => 'active'],
            ['name' => 'Training Kits', 'description' => 'Training and practice apparel', 'status' => 'active'],
            ['name' => 'Custom Apparel', 'description' => 'Customizable clothing for events and teams', 'status' => 'active'],
            ['name' => 'Accessories', 'description' => 'Sports accessories and add-ons', 'status' => 'active'],
            ['name' => 'Casual Wear', 'description' => 'Casual sports and lifestyle clothing', 'status' => 'active'],
            ['name' => 'Kids Collection', 'description' => 'Youth and kids sporting apparel', 'status' => 'active'],
        ];

        foreach ($categories as $category) {
            Category::create([
                ...$category,
                'created_by' => $admin->id,
            ]);
        }
    }
}
