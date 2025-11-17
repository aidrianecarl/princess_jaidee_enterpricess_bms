<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Category;
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

        $jerseyCategory = Category::where('name', 'Sports Jerseys')->first() ?? Category::first();
        $athleticCategory = Category::where('name', 'Athletic Wear')->first() ?? Category::first();
        $uniformsCategory = Category::where('name', 'Team Uniforms')->first() ?? Category::first();

        $products = [
            [
                'name' => 'Premium Basketball Jersey',
                'description' => 'High-quality polyester basketball jersey with custom printing',
                'category_id' => $jerseyCategory->id,
                'base_price' => 450.00,
                'unit_cost' => 200.00,
                'sku' => 'BBJ-001',
                'quantity_in_stock' => 150,
                'status' => 'active',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Volleyball Jersey',
                'description' => 'Lightweight volleyball jersey with moisture-wicking technology',
                'category_id' => $jerseyCategory->id,
                'base_price' => 400.00,
                'unit_cost' => 180.00,
                'sku' => 'VBJ-001',
                'quantity_in_stock' => 120,
                'status' => 'active',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Football Jersey',
                'description' => 'Professional football jersey for teams and clubs',
                'category_id' => $jerseyCategory->id,
                'base_price' => 480.00,
                'unit_cost' => 220.00,
                'sku' => 'FBJ-001',
                'quantity_in_stock' => 100,
                'status' => 'active',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Casual T-Shirt',
                'description' => 'Comfortable 100% cotton t-shirt with custom print',
                'category_id' => $athleticCategory->id,
                'base_price' => 250.00,
                'unit_cost' => 100.00,
                'sku' => 'TSH-001',
                'quantity_in_stock' => 300,
                'status' => 'active',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Performance Athletic Shirt',
                'description' => 'Breathable athletic shirt with advanced fabric technology',
                'category_id' => $athleticCategory->id,
                'base_price' => 350.00,
                'unit_cost' => 150.00,
                'sku' => 'ASH-001',
                'quantity_in_stock' => 200,
                'status' => 'active',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Sports Shorts',
                'description' => 'Comfortable sports shorts with internal pockets',
                'category_id' => $athleticCategory->id,
                'base_price' => 320.00,
                'unit_cost' => 140.00,
                'sku' => 'SHT-001',
                'quantity_in_stock' => 180,
                'status' => 'active',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Basketball Shorts',
                'description' => 'High-performance basketball shorts',
                'category_id' => $athleticCategory->id,
                'base_price' => 380.00,
                'unit_cost' => 170.00,
                'sku' => 'BSH-001',
                'quantity_in_stock' => 150,
                'status' => 'active',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Windbreaker Jacket',
                'description' => 'Lightweight windbreaker for outdoor activities',
                'category_id' => $uniformsCategory->id,
                'base_price' => 550.00,
                'unit_cost' => 250.00,
                'sku' => 'WBJ-001',
                'quantity_in_stock' => 80,
                'status' => 'active',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Team Logo Jacket',
                'description' => 'Professional team jacket with embroidered logo',
                'category_id' => $uniformsCategory->id,
                'base_price' => 650.00,
                'unit_cost' => 300.00,
                'sku' => 'TLJ-001',
                'quantity_in_stock' => 60,
                'status' => 'active',
                'created_by' => $admin->id,
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
