<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Category;
use App\Models\Color;
use App\Models\Size;
use Illuminate\Database\Seeder;
use App\Models\User;

class ProductsSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@princessjaidee.com')->first();
        
        if (!$admin) {
            return;
        }

        $jerseyCategory = Category::firstOrCreate(
            ['name' => 'Sports Jerseys'],
            ['description' => 'Sports jerseys and athletic apparel', 'status' => 'active', 'created_by' => $admin->id]
        );
        $athleticCategory = Category::firstOrCreate(
            ['name' => 'Athletic Wear'],
            ['description' => 'Athletic wear and accessories', 'status' => 'active', 'created_by' => $admin->id]
        );
        $uniformsCategory = Category::firstOrCreate(
            ['name' => 'Team Uniforms'],
            ['description' => 'Team uniforms and gear', 'status' => 'active', 'created_by' => $admin->id]
        );

        $redColor = Color::firstOrCreate(['name' => 'Red'], ['hex_code' => '#EF4444']);
        $blackColor = Color::firstOrCreate(['name' => 'Black'], ['hex_code' => '#000000']);
        $whiteColor = Color::firstOrCreate(['name' => 'White'], ['hex_code' => '#FFFFFF']);
        $blueColor = Color::firstOrCreate(['name' => 'Blue'], ['hex_code' => '#3B82F6']);

        $mediumSize = Size::firstOrCreate(['name' => 'M'], ['description' => 'Medium']);
        $largeSize = Size::firstOrCreate(['name' => 'L'], ['description' => 'Large']);
        $xlSize = Size::firstOrCreate(['name' => 'XL'], ['description' => 'Extra Large']);

        $products = [
            [
                'name' => 'Premium Basketball Jersey',
                'description' => 'High-quality polyester basketball jersey with custom printing',
                'category_id' => $jerseyCategory->id,
                'color_id' => $redColor->id,
                'size_id' => $largeSize->id,
                'base_price' => 450.00,
                'unit_cost' => 200.00,
                'quantity_in_stock' => 150,
                'reorder_level' => 10,
                'status' => 'active',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Volleyball Jersey',
                'description' => 'Lightweight volleyball jersey with moisture-wicking technology',
                'category_id' => $jerseyCategory->id,
                'color_id' => $whiteColor->id,
                'size_id' => $mediumSize->id,
                'base_price' => 400.00,
                'unit_cost' => 180.00,
                'quantity_in_stock' => 120,
                'reorder_level' => 10,
                'status' => 'active',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Football Jersey',
                'description' => 'Professional football jersey for teams and clubs',
                'category_id' => $jerseyCategory->id,
                'color_id' => $blueColor->id,
                'size_id' => $xlSize->id,
                'base_price' => 480.00,
                'unit_cost' => 220.00,
                'quantity_in_stock' => 100,
                'reorder_level' => 10,
                'status' => 'active',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Casual T-Shirt',
                'description' => 'Comfortable 100% cotton t-shirt with custom print',
                'category_id' => $athleticCategory->id,
                'color_id' => $blackColor->id,
                'size_id' => $mediumSize->id,
                'base_price' => 250.00,
                'unit_cost' => 100.00,
                'quantity_in_stock' => 300,
                'reorder_level' => 10,
                'status' => 'active',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Performance Athletic Shirt',
                'description' => 'Breathable athletic shirt with advanced fabric technology',
                'category_id' => $athleticCategory->id,
                'color_id' => $redColor->id,
                'size_id' => $largeSize->id,
                'base_price' => 350.00,
                'unit_cost' => 150.00,
                'quantity_in_stock' => 200,
                'reorder_level' => 10,
                'status' => 'active',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Sports Shorts',
                'description' => 'Comfortable sports shorts with internal pockets',
                'category_id' => $athleticCategory->id,
                'color_id' => $blueColor->id,
                'size_id' => $mediumSize->id,
                'base_price' => 320.00,
                'unit_cost' => 140.00,
                'quantity_in_stock' => 180,
                'reorder_level' => 10,
                'status' => 'active',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Basketball Shorts',
                'description' => 'High-performance basketball shorts',
                'category_id' => $athleticCategory->id,
                'color_id' => $blackColor->id,
                'size_id' => $largeSize->id,
                'base_price' => 380.00,
                'unit_cost' => 170.00,
                'quantity_in_stock' => 150,
                'reorder_level' => 10,
                'status' => 'active',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Windbreaker Jacket',
                'description' => 'Lightweight windbreaker for outdoor activities',
                'category_id' => $uniformsCategory->id,
                'color_id' => $whiteColor->id,
                'size_id' => $largeSize->id,
                'base_price' => 550.00,
                'unit_cost' => 250.00,
                'quantity_in_stock' => 80,
                'reorder_level' => 10,
                'status' => 'active',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Team Logo Jacket',
                'description' => 'Professional team jacket with embroidered logo',
                'category_id' => $uniformsCategory->id,
                'color_id' => $redColor->id,
                'size_id' => $xlSize->id,
                'base_price' => 650.00,
                'unit_cost' => 300.00,
                'quantity_in_stock' => 60,
                'reorder_level' => 10,
                'status' => 'active',
                'created_by' => $admin->id,
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
