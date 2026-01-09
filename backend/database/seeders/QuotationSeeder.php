<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Quotation;
use App\Models\Customer;
use App\Models\User;
use Carbon\Carbon;

class QuotationSeeder extends Seeder
{
    public function run(): void
    {
        $cashier = User::where('email', 'cashier@princessjaidee.com')->first();
        $customers = Customer::take(3)->get();

        if (!$cashier || $customers->isEmpty()) {
            return;
        }

        // ✅ MUST match ENUM exactly
        $statuses = [
            'draft',
            'pending_approval',
            'approved',
            'rejected',
        ];

        $index = 0;

        foreach ($customers as $customer) {
            Quotation::create([
                'quotation_number' => 'QT-' . date('Ymd') . '-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                'customer_id' => $customer->id,
                'created_by' => $cashier->id,
                'subtotal' => 50000.00,
                'discount' => 5000.00,
                'tax' => 5400.00,
                'total' => 50400.00,
                'currency' => 'PHP',
                'status' => $statuses[$index % count($statuses)],
                'notes' => 'Quotation for sports jerseys and custom printing services',
                'terms_conditions' => 'Standard business terms apply. 50% deposit required.',
                'valid_until' => Carbon::now()->addDays(30),
                'scheduled_send_date' => null,
                'sent_at' => $index === 0 ? Carbon::now() : null,
            ]);

            $index++;
        }
    }
}
