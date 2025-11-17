<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\JobOrder;
use App\Models\Order;
use App\Models\Customer;
use App\Models\User;
use Carbon\Carbon;

class JobOrderSeeder extends Seeder
{
    public function run(): void
    {
        $designer = User::where('email', 'designer@princessjaidee.com')->first();
        $customer = Customer::first();
        $order = Order::first();

        if (!$designer || !$customer || !$order) {
            return; // Skip if required records don't exist
        }

        JobOrder::create([
            'job_order_number' => 'JO-' . date('Ymd') . '-001',
            'order_id' => $order->id,
            'customer_id' => $customer->id,
            'assigned_to' => $designer->id,
            'start_date' => Carbon::now()->toDateString(),
            'due_date' => Carbon::now()->addDays(5)->toDateString(),
            'completed_date' => null,
            'status' => 'in-progress',
            'priority' => 'high',
            'notes' => 'Custom printing design for sports jerseys',
        ]);

        JobOrder::create([
            'job_order_number' => 'JO-' . date('Ymd') . '-002',
            'order_id' => $order->id,
            'customer_id' => $customer->id,
            'assigned_to' => $designer->id,
            'start_date' => Carbon::now()->subDays(10)->toDateString(),
            'due_date' => Carbon::now()->toDateString(),
            'completed_date' => Carbon::now()->toDateString(),
            'status' => 'completed',
            'priority' => 'medium',
            'notes' => 'Embroidery work completed successfully',
        ]);
    }
}
