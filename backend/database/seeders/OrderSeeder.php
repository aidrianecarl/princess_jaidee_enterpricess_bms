<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\Customer;
use App\Models\User;
use App\Models\Quotation;
use Carbon\Carbon;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $cashier = User::where('email', 'cashier@princessjaidee.com')->first();
        $customer = Customer::first();
        $quotation = Quotation::first();

        if (!$cashier || !$customer) {
            return;
        }

        Order::create([
            'order_number' => 'ORD-' . date('Ymd') . '-001',
            'quotation_id' => $quotation?->id,
            'customer_id' => $customer->id,
            'created_by' => $cashier->id,
            'order_date' => Carbon::now()->toDateString(),
            'subtotal' => 50000.00,
            'discount' => 5000.00,
            'tax' => 5400.00,
            'total' => 50400.00,
            'payment_status' => 'partial',
            'order_status' => 'processing',
            'payment_method' => 'Bank Transfer',
            'notes' => 'Rush order - deliver within 5 days',
        ]);

        Order::create([
            'order_number' => 'ORD-' . date('Ymd') . '-002',
            'quotation_id' => null,
            'customer_id' => Customer::skip(1)->first()?->id ?? $customer->id,
            'created_by' => $cashier->id,
            'order_date' => Carbon::now()->subDays(10)->toDateString(),
            'subtotal' => 75000.00,
            'discount' => 7500.00,
            'tax' => 8100.00,
            'total' => 75600.00,
            'payment_status' => 'paid',
            'order_status' => 'completed',
            'payment_method' => 'Cash',
            'notes' => 'Walk-in customer order completed',
        ]);
    }
}
