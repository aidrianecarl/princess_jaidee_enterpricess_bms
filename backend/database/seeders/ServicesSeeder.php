<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServicesSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            [
                'name' => 'Custom Embroidery',
                'description' => 'Professional embroidery service for logos and designs',
                'price' => 150.00,
                'duration' => '5-7 working days',
                'specifications' => 'High-quality thread, up to 10,000 stitches per piece',
                'status' => 'active',
            ],
            [
                'name' => 'Screen Printing',
                'description' => 'High-quality screen printing for bulk orders',
                'price' => 80.00,
                'duration' => '3-5 working days',
                'specifications' => 'Water-based and eco-friendly inks',
                'status' => 'active',
            ],
            [
                'name' => 'Direct-to-Garment (DTG) Printing',
                'description' => 'Full-color digital printing directly on fabric',
                'price' => 120.00,
                'duration' => '2-3 working days',
                'specifications' => 'Full color capability, high resolution',
                'status' => 'active',
            ],
            [
                'name' => 'Heat Transfer Printing',
                'description' => 'Professional heat transfer for vibrant graphics',
                'price' => 100.00,
                'duration' => '2-4 working days',
                'specifications' => 'Durable and long-lasting prints',
                'status' => 'active',
            ],
            [
                'name' => 'Custom Patches',
                'description' => 'Woven and embroidered custom patches',
                'price' => 200.00,
                'duration' => '7-10 working days',
                'specifications' => 'Woven labels and patches, fully customizable',
                'status' => 'active',
            ],
            [
                'name' => 'Sublimation Printing',
                'description' => 'High-definition sublimation printing for polyester',
                'price' => 110.00,
                'duration' => '2-3 working days',
                'specifications' => 'Permanent, fade-resistant colors',
                'status' => 'active',
            ],
            [
                'name' => 'Garment Modification',
                'description' => 'Tailoring, hemming, and custom modifications',
                'price' => 90.00,
                'duration' => '3-5 working days',
                'specifications' => 'Professional tailoring service',
                'status' => 'active',
            ],
            [
                'name' => 'Rush Order Processing',
                'description' => 'Express delivery service for urgent orders',
                'price' => 250.00,
                'duration' => '24-48 hours',
                'specifications' => 'Premium rush delivery',
                'status' => 'active',
            ],
            [
                'name' => 'Design Consultation',
                'description' => 'Professional design assistance for custom projects',
                'price' => 300.00,
                'duration' => '1-2 working days',
                'specifications' => 'Expert design consultation with mockups',
                'status' => 'active',
            ],
        ];

        foreach ($services as $service) {
            Service::create($service);
        }
    }
}
