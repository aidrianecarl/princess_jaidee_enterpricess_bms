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
                'description' => 'Professional embroidery service for logos and designs',
                'category' => 'embroidery',
                'base_price' => 150.00,
                'specifications' => [], // ✅ BLANK
                'requires_design' => true,
                'requires_team' => false,
                'requires_size' => false,
                'status' => 'active',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Screen Printing',
                'description' => 'High-quality screen printing for bulk orders',
                'category' => 'printing',
                'base_price' => 80.00,
                'specifications' => [], // ✅ BLANK
                'requires_design' => true,
                'requires_team' => false,
                'requires_size' => false,
                'status' => 'active',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Direct-to-Garment (DTG) Printing',
                'description' => 'Full-color digital printing directly on fabric',
                'category' => 'printing',
                'base_price' => 120.00,
                'specifications' => [],
                'requires_design' => true,
                'requires_team' => false,
                'requires_size' => false,
                'status' => 'active',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Heat Transfer Printing',
                'description' => 'Professional heat transfer for vibrant graphics',
                'category' => 'printing',
                'base_price' => 100.00,
                'specifications' => [],
                'requires_design' => true,
                'requires_team' => false,
                'requires_size' => false,
                'status' => 'active',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Custom Patches',
                'description' => 'Woven and embroidered custom patches',
                'category' => 'patches',
                'base_price' => 200.00,
                'specifications' => [],
                'requires_design' => true,
                'requires_team' => false,
                'requires_size' => false,
                'status' => 'active',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Sublimation Printing',
                'description' => 'High-definition sublimation printing for polyester',
                'category' => 'printing',
                'base_price' => 110.00,
                'specifications' => [],
                'requires_design' => true,
                'requires_team' => true,
                'requires_size' => true,
                'status' => 'active',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Tarpaulin Printing',
                'description' => 'Professional tarpaulin printing service with custom width and height specifications',
                'category' => 'printing',
                'base_price' => 240.00,
                'specifications' => [
                    'size_type' => 'tarpaulin',
                    'width_min' => 3,
                    'width_max' => 10,
                    'height_min' => 2,
                    'height_max' => 10,
                    'unit' => 'feet',
                    'price_per_sqft' => 20,
                ],
                'requires_design' => true,
                'requires_team' => false,
                'requires_size' => true,
                'status' => 'active',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Garment Modification',
                'description' => 'Tailoring, hemming, and custom modifications',
                'category' => 'tailoring',
                'base_price' => 90.00,
                'specifications' => [],
                'requires_design' => false,
                'requires_team' => false,
                'requires_size' => true,
                'status' => 'active',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Uniform Customization',
                'description' => 'Team uniform design and customization service',
                'category' => 'uniforms',
                'base_price' => 250.00,
                'specifications' => [],
                'requires_design' => true,
                'requires_team' => true,
                'requires_size' => true,
                'status' => 'active',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Design Consultation',
                'description' => 'Professional design assistance for custom projects',
                'category' => 'consultation',
                'base_price' => 300.00,
                'specifications' => [],
                'requires_design' => false,
                'requires_team' => false,
                'requires_size' => false,
                'status' => 'active',
                'created_by' => $admin->id,
            ],
        ];

        foreach ($services as $service) {
            Service::create($service);
        }
    }
}
