<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\QuotationItem;
use App\Models\Quotation;
use App\Models\Product;
use App\Models\Service;

class QuotationItemSeeder extends Seeder
{
    public function run(): void
    {
        $quotation = Quotation::first();

        if (!$quotation) {
            return;
        }

        // Add product item
        $product = Product::first();
        if ($product) {
            QuotationItem::create([
                'quotation_id' => $quotation->id,
                'product_id' => $product->id,
                'service_id' => null,
                'description' => $product->name,
                'quantity' => 50,
                'unit_price' => $product->base_price,
                'line_total' => 50 * $product->base_price,
            ]);
        }

        // Add service item
        $service = Service::first();
        if ($service) {
            QuotationItem::create([
                'quotation_id' => $quotation->id,
                'product_id' => null,
                'service_id' => $service->id,
                'description' => $service->name,
                'quantity' => 1,
                'unit_price' => $service->base_price,
                'line_total' => $service->base_price,
            ]);
        }
    }
}
