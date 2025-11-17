<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TermsConditions;

class TermsConditionsSeeder extends Seeder
{
    public function run(): void
    {
        TermsConditions::create([
            'title' => 'Princess Jaidee Enterprises - Terms and Conditions',
            'content' => <<<'EOT'
<h2>Terms and Conditions</h2>

<h3>1. Acceptance of Terms</h3>
<p>By using Princess Jaidee Enterprises' services and purchasing our products, you agree to be bound by these terms and conditions.</p>

<h3>2. Product Availability</h3>
<p>All products and services are subject to availability. We reserve the right to discontinue any product or service at any time.</p>

<h3>3. Pricing</h3>
<p>All prices are quoted in Philippine Pesos (PHP) and are subject to change without notice. We reserve the right to update pricing information.</p>

<h3>4. Payment Terms</h3>
<p>Payment must be made in full before delivery unless other arrangements have been made. Accepted payment methods include bank transfer, credit card, and cash on delivery.</p>

<h3>5. Delivery</h3>
<p>Delivery times are estimates and not guaranteed. We are not responsible for delays caused by factors beyond our control.</p>

<h3>6. Quality Assurance</h3>
<p>All products undergo quality checks. Defective items may be returned within 7 days of delivery for replacement or refund.</p>

<h3>7. Cancellation Policy</h3>
<p>Orders can be cancelled within 24 hours of placement. Custom orders cannot be cancelled once production has started.</p>

<h3>8. Liability Limitation</h3>
<p>Princess Jaidee Enterprises shall not be liable for any indirect, incidental, or consequential damages arising from your use of our services.</p>

<h3>9. Intellectual Property</h3>
<p>All designs and logos remain the property of Princess Jaidee Enterprises unless otherwise agreed in writing.</p>

<h3>10. Governing Law</h3>
<p>These terms and conditions are governed by the laws of the Republic of the Philippines.</p>

<p><strong>Last Updated: January 2025</strong></p>
EOT,
            'version' => 1,
            'is_active' => true,
        ]);
    }
}
