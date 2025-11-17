<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\OrderItem;
use App\Models\Order;
use App\Models\Product;
use App\Models\Service;

class OrderItemSeeder extends Seeder
{
    public function run(): void
    {
        $order = Order::first();

        if (!$order) {
            return;
        }

        // Add product items
        $products = Product::take(3)->get();
        foreach ($products as $product) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'service_id' => null,
                'description' => $product->name,
                'quantity' => rand(10, 50),
                'unit_price' => $product->base_price,
                'line_total' => rand(10, 50) * $product->base_price,
            ]);
        }

        // Add service item
        $service = Service::first();
        if ($service) {
            OrderItem::create([
                'order_id' => $order->id,
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
