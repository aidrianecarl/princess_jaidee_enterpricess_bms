<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;
use App\Models\User;

class ServicesSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@princessjaidee.com')->first();
        
        if (!$admin) {
            return;
        }

        $services = [
            [
                'name' => 'Custom Embroidery',
                'slug' => 'custom-embroidery',
                'description' => 'Professional embroidery service for logos and designs',
                'base_price' => 150.00,
                'category' => 'embroidery',
                'specifications' => json_encode(['method' => 'embroidery', 'max_stitches' => 10000]),
                'status' => 'active',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Screen Printing',
                'slug' => 'screen-printing',
                'description' => 'High-quality screen printing for bulk orders',
                'base_price' => 80.00,
                'category' => 'printing',
                'specifications' => json_encode(['method' => 'screen_print', 'ink_type' => 'water-based']),
                'status' => 'active',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Direct-to-Garment (DTG) Printing',
                'slug' => 'dtg-printing',
                'description' => 'Full-color digital printing directly on fabric',
                'base_price' => 120.00,
                'category' => 'printing',
                'specifications' => json_encode(['method' => 'dtg', 'colors' => 'full_color']),
                'status' => 'active',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Heat Transfer Printing',
                'slug' => 'heat-transfer-printing',
                'description' => 'Professional heat transfer for vibrant graphics',
                'base_price' => 100.00,
                'category' => 'printing',
                'specifications' => json_encode(['method' => 'heat_transfer', 'durability' => 'high']),
                'status' => 'active',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Custom Patches',
                'slug' => 'custom-patches',
                'description' => 'Woven and embroidered custom patches',
                'base_price' => 200.00,
                'category' => 'patches',
                'specifications' => json_encode(['type' => 'woven', 'customizable' => true]),
                'status' => 'active',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Sublimation Printing',
                'slug' => 'sublimation-printing',
                'description' => 'High-definition sublimation printing for polyester',
                'base_price' => 110.00,
                'category' => 'printing',
                'specifications' => json_encode(['method' => 'sublimation', 'permanent' => true]),
                'status' => 'active',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Garment Modification',
                'slug' => 'garment-modification',
                'description' => 'Tailoring, hemming, and custom modifications',
                'base_price' => 90.00,
                'category' => 'tailoring',
                'specifications' => json_encode(['services' => ['tailoring', 'hemming', 'modifications']]),
                'status' => 'active',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Rush Order Processing',
                'slug' => 'rush-order-processing',
                'description' => 'Express delivery service for urgent orders',
                'base_price' => 250.00,
                'category' => 'delivery',
                'specifications' => json_encode(['turnaround' => '24-48 hours', 'premium' => true]),
                'status' => 'active',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Design Consultation',
                'slug' => 'design-consultation',
                'description' => 'Professional design assistance for custom projects',
                'base_price' => 300.00,
                'category' => 'consultation',
                'specifications' => json_encode(['includes' => ['mockups', 'revisions']]),
                'status' => 'active',
                'created_by' => $admin->id,
            ],
        ];

        foreach ($services as $service) {
            Service::create($service);
        }
    }
}
