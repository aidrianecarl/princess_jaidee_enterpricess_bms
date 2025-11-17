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
        $branches = Branch::where('status', 'active')->withoutTrashed()->get();
        $products = Product::where('status', 'active')->get();

        if ($branches->isEmpty() || $products->isEmpty()) {
            echo "No active branches or products found. Skipping inventory seeding.\n";
            return;
        }

        foreach ($products as $product) {
            foreach ($branches as $branch) {
                $exists = Inventory::where('product_id', $product->id)
                    ->where('branch_id', $branch->id)
                    ->exists();

                if (!$exists) {
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
}
