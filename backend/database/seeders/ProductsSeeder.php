<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Database\Seeder;

class ProductsSeeder extends Seeder
{
    public function run(): void
    {
        $jerseyCategory = Category::where('name', 'Jersey')->first();
        $shirtCategory = Category::where('name', 'Shirts')->first();
        $shortsCategory = Category::where('name', 'Shorts')->first();
        $jacketCategory = Category::where('name', 'Jackets')->first();

        $products = [
            [
                'name' => 'Premium Basketball Jersey',
                'description' => 'High-quality polyester basketball jersey with custom printing',
                'category_id' => $jerseyCategory->id,
                'price' => 450.00,
                'cost' => 200.00,
                'sku' => 'BBJ-001',
                'stock_quantity' => 150,
                'status' => 'active',
            ],
            [
                'name' => 'Volleyball Jersey',
                'description' => 'Lightweight volleyball jersey with moisture-wicking technology',
                'category_id' => $jerseyCategory->id,
                'price' => 400.00,
                'cost' => 180.00,
                'sku' => 'VBJ-001',
                'stock_quantity' => 120,
                'status' => 'active',
            ],
            [
                'name' => 'Football Jersey',
                'description' => 'Professional football jersey for teams and clubs',
                'category_id' => $jerseyCategory->id,
                'price' => 480.00,
                'cost' => 220.00,
                'sku' => 'FBJ-001',
                'stock_quantity' => 100,
                'status' => 'active',
            ],
            [
                'name' => 'Casual T-Shirt',
                'description' => 'Comfortable 100% cotton t-shirt with custom print',
                'category_id' => $shirtCategory->id,
                'price' => 250.00,
                'cost' => 100.00,
                'sku' => 'TSH-001',
                'stock_quantity' => 300,
                'status' => 'active',
            ],
            [
                'name' => 'Performance Athletic Shirt',
                'description' => 'Breathable athletic shirt with advanced fabric technology',
                'category_id' => $shirtCategory->id,
                'price' => 350.00,
                'cost' => 150.00,
                'sku' => 'ASH-001',
                'stock_quantity' => 200,
                'status' => 'active',
            ],
            [
                'name' => 'Sports Shorts',
                'description' => 'Comfortable sports shorts with internal pockets',
                'category_id' => $shortsCategory->id,
                'price' => 320.00,
                'cost' => 140.00,
                'sku' => 'SHT-001',
                'stock_quantity' => 180,
                'status' => 'active',
            ],
            [
                'name' => 'Basketball Shorts',
                'description' => 'High-performance basketball shorts',
                'category_id' => $shortsCategory->id,
                'price' => 380.00,
                'cost' => 170.00,
                'sku' => 'BSH-001',
                'stock_quantity' => 150,
                'status' => 'active',
            ],
            [
                'name' => 'Windbreaker Jacket',
                'description' => 'Lightweight windbreaker for outdoor activities',
                'category_id' => $jacketCategory->id,
                'price' => 550.00,
                'cost' => 250.00,
                'sku' => 'WBJ-001',
                'stock_quantity' => 80,
                'status' => 'active',
            ],
            [
                'name' => 'Team Logo Jacket',
                'description' => 'Professional team jacket with embroidered logo',
                'category_id' => $jacketCategory->id,
                'price' => 650.00,
                'cost' => 300.00,
                'sku' => 'TLJ-001',
                'stock_quantity' => 60,
                'status' => 'active',
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
