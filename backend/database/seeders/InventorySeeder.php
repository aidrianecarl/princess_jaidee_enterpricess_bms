<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\Branch;

class InventorySeeder extends Seeder
{
    public function run(): void
    {
        $branches = Branch::all();
        $products = Product::all();

        foreach ($products as $product) {
            foreach ($branches as $branch) {
                Inventory::create([
                    'product_id' => $product->id,
                    'branch_id' => $branch->id,
                    'quantity' => rand(10, 100),
                    'last_restocked_at' => now(),
                ]);
            }
        }
    }
}
