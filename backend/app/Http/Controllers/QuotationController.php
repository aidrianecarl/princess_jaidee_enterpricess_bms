<?php

namespace App\Http\Controllers;

use App\Models\Quotation;
use App\Models\QuotationItem;
use App\Models\Customer;
use App\Models\User;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class QuotationController extends Controller
{
    // Get all quotations for authenticated user
    public function index(Request $request)
    {
        $userId = auth()->id();
        
        $query = Quotation::with(['customer', 'items.service'])
            ->where('created_by', $userId)
            ->withoutTrashed();

        if ($request->has('search')) {
            $query->where('quotation_number', 'like', '%' . $request->search . '%');
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $quotations = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 15);
        
        $quotations->getCollection()->transform(function ($quotation) {
            $quotation->items_count = $quotation->items->count();
            return $quotation;
        });

        return response()->json($quotations, 200);
    }

    // Get all quotations for admin (no user filter - retrieves all quotations)
    public function adminIndex(Request $request)
    {
        try {
            Log::info('Admin quotations request received', [
                'status_filter' => $request->get('status'),
                'search_filter' => $request->get('search'),
            ]);

            $query = Quotation::with(['customer', 'items.service', 'creator', 'branch'])
                ->withoutTrashed();
            Log::info('Base query built');

            // Get current user
            $currentUser = auth()->user();
            $userType = $currentUser?->user_type;
            $userBranchId = $currentUser?->branch_id;

            Log::info('User info for quotation filtering', [
                'user_type' => $userType,
                'branch_id' => $userBranchId,
            ]);

            // Filter by branch for employees - only show quotations from their branch
            if ($userType === 'employee' && $userBranchId) {
                Log::info('Filtering quotations by employee branch', ['branch_id' => $userBranchId]);
                $query->where('branch_id', $userBranchId);
            }
            // Admins see all quotations regardless of branch

            if ($request->has('search') && !empty($request->get('search'))) {
                $searchTerm = $request->get('search');
                Log::info('Applying search filter', ['search' => $searchTerm]);
                $query->where('quotation_number', 'like', '%' . $searchTerm . '%');
            }

            if ($request->has('status') && !empty($request->get('status'))) {
                $statusFilter = $request->get('status');
                Log::info('Applying status filter', ['status' => $statusFilter]);
                $query->where('status', $statusFilter);
            }

            $quotations = $query->orderBy('created_at', 'desc')->get();
            Log::info('Quotations retrieved from database', [
                'count' => $quotations->count(),
                'status_filter' => $request->get('status'),
            ]);
            
            // Transform quotations for frontend response
            $result = [];
            foreach ($quotations as $quotation) {
                try {
                    $quotationArray = [
                        'id' => $quotation->id,
                        'quotation_number' => $quotation->quotation_number,
                        'customer_id' => $quotation->customer_id,
                        'branch_id' => $quotation->branch_id,
                        'created_by' => $quotation->created_by,
                        'business_name' => $quotation->business_name,
                        'business_address' => $quotation->business_address,
                        'business_city' => $quotation->business_city,
                        'business_state' => $quotation->business_state,
                        'business_postal' => $quotation->business_postal,
                        'business_phone' => $quotation->business_phone,
                        'business_email' => $quotation->business_email,
                        'logo_url' => $quotation->logo_url,
                        'subtotal' => (float) $quotation->subtotal,
                        'discount' => (float) $quotation->discount,
                        'paid_amount' => (float) $quotation->paid_amount,
                        'total' => (float) $quotation->total,
                        'currency' => $quotation->currency,
                        'status' => $quotation->status,
                        'has_price' => $quotation->has_price,
                        'notes' => $quotation->notes,
                        'valid_until' => $quotation->valid_until,
                        'created_at' => $quotation->created_at,
                        'updated_at' => $quotation->updated_at,
                        'items_count' => $quotation->items ? count($quotation->items) : 0,
                    ];

                    // Add customer data if exists
                    if ($quotation->customer) {
                        Log::debug('Processing customer for quotation', [
                            'quotation_id' => $quotation->id,
                            'customer_id' => $quotation->customer->id,
                        ]);
                        $quotationArray['customer'] = [
                            'id' => $quotation->customer->id,
                            'quotation_id' => $quotation->customer->quotation_id,
                            'name' => $quotation->customer->bill_to_name ?? '',
                            'email' => $quotation->customer->bill_to_email ?? '',
                            'phone' => $quotation->customer->bill_to_phone ?? '',
                            'bill_to_name' => $quotation->customer->bill_to_name,
                            'bill_to_street' => $quotation->customer->bill_to_street,
                            'bill_to_city' => $quotation->customer->bill_to_city,
                            'bill_to_state' => $quotation->customer->bill_to_state,
                            'bill_to_postal' => $quotation->customer->bill_to_postal,
                            'bill_to_phone' => $quotation->customer->bill_to_phone,
                            'bill_to_email' => $quotation->customer->bill_to_email,
                        ];
                    } else {
                        Log::warning('Quotation has no customer', ['quotation_id' => $quotation->id]);
                        $quotationArray['customer'] = null;
                    }

                    // Add creator data if exists
                    if ($quotation->creator) {
                        $quotationArray['creator'] = [
                            'id' => $quotation->creator->id,
                            'first_name' => $quotation->creator->first_name,
                            'last_name' => $quotation->creator->last_name,
                            'email' => $quotation->creator->email,
                        ];
                    }

                    // Add branch data if exists
                    if ($quotation->branch) {
                        $quotationArray['branch'] = [
                            'id' => $quotation->branch->id,
                            'name' => $quotation->branch->name,
                            'location' => $quotation->branch->location,
                        ];
                    }

                    // Add items data if exists
                    if ($quotation->items) {
                        $quotationArray['items'] = $quotation->items->toArray();
                    } else {
                        $quotationArray['items'] = [];
                    }

                    $result[] = $quotationArray;
                } catch (\Exception $itemError) {
                    Log::error('Error processing quotation item', [
                        'quotation_id' => $quotation->id ?? 'unknown',
                        'error' => $itemError->getMessage(),
                        'line' => $itemError->getLine(),
                    ]);
                    throw $itemError;
                }
            }

            Log::info('Admin quotations returned successfully', ['count' => count($result)]);
            return response()->json($result, 200);
        } catch (\Exception $e) {
            Log::error('Admin quotations fetch error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'code' => $e->getCode(),
            ]);
            return response()->json([
                'error' => 'Failed to fetch quotations',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Get single quotation
    public function show($id)
    {
        $quotation = Quotation::with(['customer', 'items.service'])->find($id);

        if (!$quotation) {
            return response()->json(['error' => 'Quotation not found'], 404);
        }
        
        $quotation->items_count = $quotation->items->count();

        // Log for debugging
        \Log::info('[v0] Fetching quotation with items', [
            'quotation_id' => $id,
            'items_count' => $quotation->items->count(),
            'first_item_team_roster' => $quotation->items->first()?->team_roster ?? null,
        ]);

        return response()->json($quotation, 200);
    }


    public function getNextQuotationNumber()
    {
        $today = Carbon::today()->format('Ymd');
        
        // Get the last quotation created today
        $lastQuotation = Quotation::whereDate('created_at', Carbon::today())
            ->orderBy('id', 'desc')
            ->first();
        
        // If last quotation exists and was created today, increment the sequence number
        if ($lastQuotation) {
            // Extract the sequence number from quotation_number format: QT-YYYYMMDD-#####
            preg_match('/QT-\d+-(\d+)$/', $lastQuotation->quotation_number, $matches);
            $sequenceNumber = isset($matches[1]) ? intval($matches[1]) + 1 : 1;
        } else {
            // Reset to 1 if no quotation created today (new day)
            $sequenceNumber = 1;
        }
        
        $quotationNumber = 'QT-' . $today . '-' . str_pad($sequenceNumber, 5, '0', STR_PAD_LEFT);
        
        return response()->json([
            'quotation_number' => $quotationNumber,
            'date' => date('Y-m-d'),
        ], 200);
    }

    public function store(Request $request)
    {
        $items = $request->items;
        if (is_string($items)) {
            $items = json_decode($items, true);
            $request->merge(['items' => $items]);
        }

        $validator = Validator::make($request->all(), [
            'customer_name' => 'nullable|string',
            'customer_email' => 'nullable|email',
            'customer_phone' => 'nullable|string',
            'customer_address' => 'nullable|string',
            'customer_city' => 'nullable|string',
            'customer_province' => 'nullable|string',
            'customer_zip_code' => 'nullable|string',
            'bill_to_name' => 'nullable|string',
            'bill_to_street' => 'nullable|string',
            'bill_to_city' => 'nullable|string',
            'bill_to_state' => 'nullable|string',
            'bill_to_postal' => 'nullable|string',
            'bill_to_phone' => 'nullable|string',
            'bill_to_email' => 'nullable|email',
            'business_name' => 'nullable|string',
            'business_address' => 'nullable|string',
            'business_city' => 'nullable|string',
            'business_state' => 'nullable|string',
            'business_postal' => 'nullable|string',
            'business_phone' => 'nullable|string',
            'business_email' => 'nullable|email',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|integer',
            'items.*.service_id' => 'nullable|integer',
            'items.*.name' => 'nullable|string',
            'items.*.description' => 'nullable|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.customization' => 'nullable|string',
            'items.*.design_cost' => 'nullable|numeric|min:0',
            'items.*.notes' => 'nullable', // Accept any type - will be handled in the controller
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'discount' => 'nullable|numeric|min:0',
            'paid_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'valid_until' => 'nullable|date',
            'status' => 'nullable|in:draft,pending',
            'branch_id' => 'nullable|exists:branches,id',
        ]);

        if ($validator->fails()) {
            Log::warning('Quotation validation failed', [
                'errors' => $validator->errors(),
                'request_data' => $request->except(['logo']),
            ]);
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $userId = auth()->id();

            $logoUrl = null;
            if ($request->hasFile('logo')) {
                try {
                    $logo = $request->file('logo');
                    
                    if ($logo && $logo->isValid()) {
                        // Ensure the quotations/logos directory exists
                        $logosDir = storage_path('app/public/quotations/logos');
                        if (!is_dir($logosDir)) {
                            @mkdir($logosDir, 0755, true);
                        }
                        
                        $filename = time() . '_' . uniqid() . '.' . $logo->getClientOriginalExtension();
                        
                        // Store the file in storage/public/quotations/logos
                        $path = $logo->storeAs('quotations/logos', $filename, 'public');
                        
                        if ($path) {
                            // Build full URL with domain
                            $baseUrl = env('APP_URL', 'https://api.princessjaideeenterprises.com');
                            $logoUrl = $baseUrl . '/api/storage/app/public/quotations/logos/' . $filename;
                            
                            Log::info('Logo uploaded successfully', [
                                'path' => $path,
                                'url' => $logoUrl,
                                'filename' => $filename,
                            ]);
                        } else {
                            Log::warning('Logo file could not be stored', ['filename' => $filename]);
                        }
                    } else {
                        Log::warning('Uploaded logo file is invalid', ['error' => $logo->getError()]);
                    }
                } catch (\Exception $logoException) {
                    Log::warning('Logo upload failed, continuing without logo', [
                        'error' => $logoException->getMessage(),
                        'trace' => $logoException->getTraceAsString(),
                    ]);
                    // Continue without logo if upload fails
                }
            }

            $lastQuotation = Quotation::whereDate('created_at', Carbon::today())
                ->orderBy('id', 'desc')
                ->first();
            
            // If last quotation exists and was created today, increment the sequence number
            if ($lastQuotation) {
                // Extract the sequence number from quotation_number format: QT-YYYYMMDD-#####
                preg_match('/QT-\d+-(\d+)$/', $lastQuotation->quotation_number, $matches);
                $sequenceNumber = isset($matches[1]) ? intval($matches[1]) + 1 : 1;
            } else {
                // Reset to 1 if no quotation created today (new day)
                $sequenceNumber = 1;
            }
            
            $quotationNumber = 'QT-' . Carbon::today()->format('Ymd') . '-' . str_pad($sequenceNumber, 5, '0', STR_PAD_LEFT);

            // Use subtotal from frontend if provided, otherwise calculate
            $subtotal = $request->subtotal ?? 0;
            

            $discount = $request->discount ?? 0;
            $discountAmount = 0;
            $total = $subtotal - $discount;
            $paidAmount = $request->paid_amount ?? 0;

            $status = $request->status ?? 'draft';

            // Create customer record FIRST with bill-to information
            $customer = Customer::create([
                'bill_to_name' => $request->bill_to_name ?? 'Customer',
                'bill_to_street' => $request->bill_to_street,
                'bill_to_city' => $request->bill_to_city,
                'bill_to_state' => $request->bill_to_state,
                'bill_to_postal' => $request->bill_to_postal,
                'bill_to_phone' => $request->bill_to_phone,
                'bill_to_email' => $request->bill_to_email,
                'quotation_id' => null, // Will be set after quotation creation
            ]);

            // Now create quotation linked to the customer
            $quotation = Quotation::create([
                'quotation_number' => $quotationNumber,
                'customer_id' => $customer->id,
                'created_by' => $userId,
                'branch_id' => $request->branch_id ?? null,
                'logo_url' => $logoUrl,
                'business_name' => $request->business_name,
                'business_address' => $request->business_address,
                'business_city' => $request->business_city,
                'business_state' => $request->business_state,
                'business_postal' => $request->business_postal,
                'business_phone' => $request->business_phone,
                'business_email' => $request->business_email,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'paid_amount' => $paidAmount,
                'total' => $total,
                'currency' => 'PHP',
                'status' => $status,
                'notes' => $request->notes,
                'valid_until' => $request->valid_until,
            ]);

            // Update customer to link back to quotation using raw query to avoid mass assignment issues
            Customer::where('id', $customer->id)->update(['quotation_id' => $quotation->id]);

            foreach ($request->items as $item) {
                Log::info('[v0] Processing quotation item', [
                    'item_data' => $item,
                    'team_roster' => $item['team_roster'] ?? null,
                ]);

                $lineTotal = ($item['quantity'] ?? 0) * ($item['unit_price'] ?? 0);
                if (isset($item['design_cost'])) {
                    $lineTotal += $item['design_cost'];
                }

                // Handle design files - can be array of URLs stored as JSON
                $designFileUrl = null;
                if (!empty($item['design_file_url'])) {
                    if (is_array($item['design_file_url'])) {
                        $designFileUrl = json_encode($item['design_file_url']);
                    } else {
                        $designFileUrl = $item['design_file_url'];
                    }
                }

                // Handle notes - always store as JSON
                $notesData = null;
                if (!empty($item['notes'])) {
                    if (is_array($item['notes'])) {
                        $notesData = json_encode($item['notes']);
                    } else if (is_string($item['notes'])) {
                        // Check if it's already valid JSON
                        $decoded = json_decode($item['notes'], true);
                        $notesData = ($decoded !== null && json_last_error() === JSON_ERROR_NONE) 
                            ? $item['notes'] 
                            : json_encode(['additionalNotes' => $item['notes']]);
                    }
                }

                // Handle team roster - always store as JSON
                $teamRosterData = null;
                if (!empty($item['team_roster'])) {
                    if (is_array($item['team_roster'])) {
                        $teamRosterData = json_encode($item['team_roster']);
                    } else if (is_string($item['team_roster'])) {
                        // Check if it's already valid JSON
                        $decoded = json_decode($item['team_roster'], true);
                        $teamRosterData = ($decoded !== null && json_last_error() === JSON_ERROR_NONE) 
                            ? $item['team_roster'] 
                            : json_encode($item['team_roster']);
                    }
                }

                // Handle size specifications
                $sizeSpecsData = null;
                if (!empty($item['size_specifications'])) {
                    if (is_array($item['size_specifications'])) {
                        $sizeSpecsData = json_encode($item['size_specifications']);
                    } else if (is_string($item['size_specifications'])) {
                        // Check if it's already valid JSON
                        $decoded = json_decode($item['size_specifications'], true);
                        $sizeSpecsData = ($decoded !== null && json_last_error() === JSON_ERROR_NONE) 
                            ? $item['size_specifications'] 
                            : json_encode($item['size_specifications']);
                    }
                }

                // Handle tarpaulin details (same as size_specifications for tarpaulin services)
                $tarpaulinDetailsData = null;
                if (!empty($item['size_specifications']) && !empty($item['service_id'])) {
                    $service = \App\Models\Service::find($item['service_id']);
                    if ($service) {
                        $specs = is_string($service->specifications) 
                            ? json_decode($service->specifications, true) 
                            : $service->specifications;
                        if ($specs && isset($specs['size_type']) && $specs['size_type'] === 'tarpaulin') {
                            $tarpaulinDetailsData = $sizeSpecsData;
                        }
                    }
                }

                // Handle design consultation
                $designConsultationData = null;
                if (!empty($item['design_consultation'])) {
                    if (is_array($item['design_consultation'])) {
                        $designConsultationData = json_encode($item['design_consultation']);
                    } else if (is_string($item['design_consultation'])) {
                        // Check if it's already valid JSON
                        $decoded = json_decode($item['design_consultation'], true);
                        $designConsultationData = ($decoded !== null && json_last_error() === JSON_ERROR_NONE) 
                            ? $item['design_consultation'] 
                            : json_encode($item['design_consultation']);
                    }
                }

                $quotationItem = QuotationItem::create([
                    'quotation_id' => $quotation->id,
                    'service_id' => !empty($item['service_id']) ? $item['service_id'] : null,
                    'name' => $item['name'] ?? $item['customization'] ?? null,
                    'description' => $item['description'] ?? null,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'line_total' => $lineTotal,
                    'design_file_url' => $designFileUrl,
                    'team_roster' => $teamRosterData,
                    'size_specifications' => $sizeSpecsData,
                    'tarpaulin_details' => $tarpaulinDetailsData,
                    'design_consultation' => $designConsultationData,
                    'notes' => $notesData,
                ]);

                Log::info('[v0] Quotation item created successfully', [
                    'item_id' => $quotationItem->id,
                    'quotation_id' => $quotation->id,
                    'team_roster_saved' => $teamRosterData,
                    'size_specs_saved' => $sizeSpecsData,
                ]);
            }
            
            $quotation->load(['customer', 'items.service']);
            $quotation->items_count = $quotation->items->count();

            return response()->json([
                'message' => 'Quotation created successfully',
                'quotation' => $quotation,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Quotation creation error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'user_id' => auth()->id(),
            ]);
            return response()->json([
                'error' => 'Failed to create quotation',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    public function update(Request $request, $id)
    {
        $quotation = Quotation::with(['items'])->find($id);

        if (!$quotation) {
            return response()->json(['error' => 'Quotation not found'], 404);
        }
        
        // Only allow editing if status is draft
        if ($quotation->status !== 'draft') {
            return response()->json(['error' => 'Can only edit draft quotations'], 403);
        }

        $items = $request->items;
        if (is_string($items)) {
            $items = json_decode($items, true);
            $request->merge(['items' => $items]);
        }

        $validator = Validator::make($request->all(), [
            'customer_name' => 'sometimes|required|string',
            'customer_email' => 'nullable|email',
            'customer_phone' => 'nullable|string',
            'customer_address' => 'nullable|string',
            'customer_city' => 'nullable|string',
            'customer_province' => 'nullable|string',
            'customer_zip_code' => 'nullable|string',
            'business_name' => 'sometimes|required|string',
            'business_address' => 'nullable|string',
            'business_city' => 'nullable|string',
            'business_state' => 'nullable|string',
            'business_postal' => 'nullable|string',
            'business_phone' => 'nullable|string',
            'business_email' => 'nullable|email',
            'items' => 'sometimes|required|array|min:1',
            'items.*.product_id' => 'nullable|integer',
            'items.*.service_id' => 'nullable|integer',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.customization' => 'nullable|string',
            'items.*.design_cost' => 'nullable|numeric|min:0',
            'items.*.notes' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'notes' => 'nullable|string',
            'valid_until' => 'nullable|date',
            'status' => 'nullable|in:draft,pending',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // Update customer with bill_to_* fields if provided
            if ($request->has('bill_to_name') || $request->has('bill_to_email')) {
                $customerData = [];
                
                if ($request->has('bill_to_name')) {
                    $customerData['bill_to_name'] = $request->bill_to_name;
                }
                if ($request->has('bill_to_street')) {
                    $customerData['bill_to_street'] = $request->bill_to_street;
                }
                if ($request->has('bill_to_city')) {
                    $customerData['bill_to_city'] = $request->bill_to_city;
                }
                if ($request->has('bill_to_state')) {
                    $customerData['bill_to_state'] = $request->bill_to_state;
                }
                if ($request->has('bill_to_postal')) {
                    $customerData['bill_to_postal'] = $request->bill_to_postal;
                }
                if ($request->has('bill_to_phone')) {
                    $customerData['bill_to_phone'] = $request->bill_to_phone;
                }
                if ($request->has('bill_to_email')) {
                    $customerData['bill_to_email'] = $request->bill_to_email;
                }

                if (!empty($customerData) && $quotation->customer) {
                    $quotation->customer->update($customerData);
                }
            }

            // Also update quotation's bill_to_* fields
            $quotationData = [];
            if ($request->has('bill_to_name')) {
                $quotationData['bill_to_name'] = $request->bill_to_name;
            }
            if ($request->has('bill_to_street')) {
                $quotationData['bill_to_street'] = $request->bill_to_street;
            }
            if ($request->has('bill_to_city')) {
                $quotationData['bill_to_city'] = $request->bill_to_city;
            }
            if ($request->has('bill_to_state')) {
                $quotationData['bill_to_state'] = $request->bill_to_state;
            }
            if ($request->has('bill_to_postal')) {
                $quotationData['bill_to_postal'] = $request->bill_to_postal;
            }
            if ($request->has('bill_to_phone')) {
                $quotationData['bill_to_phone'] = $request->bill_to_phone;
            }
            if ($request->has('bill_to_email')) {
                $quotationData['bill_to_email'] = $request->bill_to_email;
            }

            if ($request->hasFile('logo')) {
                // Delete old logo if exists
                if ($quotation->logo_url) {
                    // Extract the path from the URL and delete the file
                    try {
                        $oldPath = str_replace('/storage/', '', parse_url($quotation->logo_url, PHP_URL_PATH));
                        if (Storage::disk('public')->exists($oldPath)) {
                            Storage::disk('public')->delete($oldPath);
                            Log::info('Old logo deleted', ['path' => $oldPath]);
                        }
                    } catch (\Exception $e) {
                        Log::warning('Failed to delete old logo', ['error' => $e->getMessage()]);
                    }
                }
                
                $logo = $request->file('logo');
                if ($logo && $logo->isValid()) {
                    // Ensure the quotations/logos directory exists
                    $logosDir = storage_path('app/public/quotations/logos');
                    if (!is_dir($logosDir)) {
                        @mkdir($logosDir, 0755, true);
                    }
                    
                    $filename = time() . '_' . uniqid() . '.' . $logo->getClientOriginalExtension();
                    $path = $logo->storeAs('quotations/logos', $filename, 'public');
                    
                    if ($path) {
                        // Build full URL with domain
                        $baseUrl = env('APP_URL', 'https://api.princessjaideeenterprises.com');
                        $quotation->logo_url = $baseUrl . '/api/storage/app/public/quotations/logos/' . $filename;
                        Log::info('New logo uploaded successfully', [
                            'path' => $path,
                            'url' => $quotation->logo_url
                        ]);
                    }
                }
            }

            // Update items if provided
            if ($request->has('items')) {
                // Delete existing items
                $quotation->items()->delete();
                
                // Use subtotal from frontend if provided, otherwise calculate
                $subtotal = $request->subtotal ?? 0;
                if ($subtotal == 0) {
                    foreach ($request->items as $item) {
                        $lineTotal = ($item['quantity'] ?? 0) * ($item['unit_price'] ?? 0);
                        if (isset($item['design_cost'])) {
                            $lineTotal += $item['design_cost'];
                        }
                        $subtotal += $lineTotal;
                    }
                }
                
                foreach ($request->items as $item) {
                    Log::info('[v0] Updating quotation item', [
                        'item_data' => $item,
                        'team_roster' => $item['team_roster'] ?? null,
                    ]);

                    // Handle design files - can be array of URLs stored as JSON
                    $designFileUrl = null;
                    if (!empty($item['design_file_url'])) {
                        if (is_array($item['design_file_url'])) {
                            $designFileUrl = json_encode($item['design_file_url']);
                        } else {
                            $designFileUrl = $item['design_file_url'];
                        }
                    }

                    // Handle notes - always store as JSON
                    $notesData = null;
                    if (!empty($item['notes'])) {
                        if (is_array($item['notes'])) {
                            $notesData = json_encode($item['notes']);
                        } else if (is_string($item['notes'])) {
                            // Try to decode if it's already a JSON string
                            $decoded = json_decode($item['notes'], true);
                            $notesData = $decoded !== null ? json_encode($decoded) : json_encode(['additionalNotes' => $item['notes']]);
                        }
                    }

                    // Handle team roster - always store as JSON
                    $teamRosterData = null;
                    if (!empty($item['team_roster'])) {
                        if (is_array($item['team_roster'])) {
                            $teamRosterData = json_encode($item['team_roster']);
                        } else if (is_string($item['team_roster'])) {
                            $decoded = json_decode($item['team_roster'], true);
                            $teamRosterData = $decoded !== null ? json_encode($decoded) : $item['team_roster'];
                        }
                    }

                    // Handle size specifications
                    $sizeSpecsData = null;
                    if (!empty($item['size_specifications'])) {
                        if (is_array($item['size_specifications'])) {
                            $sizeSpecsData = json_encode($item['size_specifications']);
                        } else if (is_string($item['size_specifications'])) {
                            $decoded = json_decode($item['size_specifications'], true);
                            $sizeSpecsData = $decoded !== null ? json_encode($decoded) : $item['size_specifications'];
                        }
                    }

                    // Handle tarpaulin details (same as size_specifications for tarpaulin services)
                    $tarpaulinDetailsData = null;
                    if (!empty($item['size_specifications']) && !empty($item['service_id'])) {
                        $service = \App\Models\Service::find($item['service_id']);
                        if ($service) {
                            $specs = json_decode($service->specifications, true);
                            if ($specs && isset($specs['size_type']) && $specs['size_type'] === 'tarpaulin') {
                                $tarpaulinDetailsData = $sizeSpecsData;
                            }
                        }
                    }

                    // Handle design consultation
                    $designConsultationData = null;
                    if (!empty($item['design_consultation'])) {
                        if (is_array($item['design_consultation'])) {
                            $designConsultationData = json_encode($item['design_consultation']);
                        } else if (is_string($item['design_consultation'])) {
                            $decoded = json_decode($item['design_consultation'], true);
                            $designConsultationData = $decoded !== null ? json_encode($decoded) : $item['design_consultation'];
                        }
                    }

                    $lineTotal = ($item['quantity'] ?? 0) * ($item['unit_price'] ?? 0);
                    if (isset($item['design_cost'])) {
                        $lineTotal += $item['design_cost'];
                    }

                    QuotationItem::create([
                        'quotation_id' => $quotation->id,
                        'service_id' => !empty($item['service_id']) ? $item['service_id'] : null,
                        'name' => $item['name'] ?? $item['customization'] ?? null,
                        'description' => $item['description'] ?? null,
                        'quantity' => $item['quantity'],
                        'unit_price' => $item['unit_price'],
                        'line_total' => $lineTotal,
                        'design_file_url' => $designFileUrl,
                        'team_roster' => $teamRosterData,
                        'size_specifications' => $sizeSpecsData,
                        'tarpaulin_details' => $tarpaulinDetailsData,
                        'design_consultation' => $designConsultationData,
                        'notes' => $notesData,
                    ]);

                    Log::info('[v0] Quotation item updated successfully', [
                        'quotation_id' => $quotation->id,
                        'team_roster_saved' => $teamRosterData,
                        'size_specs_saved' => $sizeSpecsData,
                    ]);
                }
                
                // Update quotation totals
                $quotation->subtotal = $subtotal;
                $quotation->total = $subtotal;
            }

            if ($request->has('business_name')) {
                $quotation->business_name = $request->business_name;
            }
            if ($request->has('business_address')) {
                $quotation->business_address = $request->business_address;
            }
            if ($request->has('business_city')) {
                $quotation->business_city = $request->business_city;
            }
            if ($request->has('business_state')) {
                $quotation->business_state = $request->business_state;
            }
            if ($request->has('business_postal')) {
                $quotation->business_postal = $request->business_postal;
            }
            if ($request->has('business_phone')) {
                $quotation->business_phone = $request->business_phone;
            }
            if ($request->has('business_email')) {
                $quotation->business_email = $request->business_email;
            }

            // Update bill_to_* fields in quotation
            foreach ($quotationData as $key => $value) {
                $quotation->{$key} = $value;
            }

            // Update other fields
            if ($request->has('notes')) {
                $quotation->notes = $request->notes;
            }
            
            if ($request->has('valid_until')) {
                $quotation->valid_until = $request->valid_until;
            }
            
            if ($request->has('status')) {
                $quotation->status = $request->status;
            }

            $quotation->save();
            $quotation->load(['customer', 'items.service']);
            $quotation->items_count = $quotation->items->count();

            return response()->json([
                'message' => 'Quotation updated successfully',
                'quotation' => $quotation,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Quotation update error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'quotation_id' => $id,
                'user_id' => auth()->id(),
            ]);
            return response()->json([
                'error' => 'Failed to update quotation',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function uploadLogo(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $logo = $request->file('logo');
            $filename = time() . '_' . uniqid() . '.' . $logo->getClientOriginalExtension();
            $path = $logo->storeAs('logos', $filename, 'public');
            
            return response()->json([
                'message' => 'Logo uploaded successfully',
                'logo_url' => 'storage/logos/' . $filename,
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Update quotation status
    public function updateStatus(Request $request, $id)
    {
        $quotation = Quotation::find($id);

        if (!$quotation) {
            return response()->json(['error' => 'Quotation not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:draft,pending_approval,approved,rejected',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $quotation->update([
            'status' => $request->status,
        ]);
        
        $quotation->load(['customer', 'items.product', 'items.service', 'creator']);
        $quotation->items_count = $quotation->items->count();

        return response()->json([
            'message' => 'Quotation status updated successfully',
            'quotation' => $quotation,
        ], 200);
    }

    // Delete quotation
    public function destroy($id)
    {
        $quotation = Quotation::find($id);

        if (!$quotation) {
            return response()->json(['error' => 'Quotation not found'], 404);
        }

        $quotation->items()->delete();
        $quotation->delete();

        return response()->json([
            'message' => 'Quotation deleted successfully',
        ], 200);
    }

    

    // Admin view single quotation
    public function adminShow($id)
    {
        try {
            error_log('[v0] AdminShow - Fetching quotation ID: ' . $id);
            
            $quotation = Quotation::with(['customer', 'items.service'])->find($id);
            
            if (!$quotation) {
                error_log('[v0] AdminShow - Quotation not found for ID: ' . $id);
                return response()->json(['error' => 'Quotation not found'], 404);
            }

            // Log service image URLs and size specifications for debugging
            foreach ($quotation->items as $item) {
                if ($item->service) {
                    error_log('[v0] AdminShow - Item ' . $item->id . ' Service: ' . $item->service->name . ' Image URL: ' . ($item->service->image_url ?? 'NULL'));
                    error_log('[v0] AdminShow - Item ' . $item->id . ' size_specifications type: ' . gettype($item->size_specifications) . ' value: ' . substr($item->size_specifications, 0, 200));
                    error_log('[v0] AdminShow - Item ' . $item->id . ' has design_consultation: ' . (isset($item->design_consultation) ? 'yes' : 'no'));
                }
            }

            error_log('[v0] AdminShow - Quotation found with ' . count($quotation->items) . ' items, returning data');
            return response()->json($quotation, 200);
        } catch (\Exception $e) {
            error_log('[v0] AdminShow ERROR: ' . $e->getMessage());
            error_log('[v0] AdminShow Stack: ' . $e->getTraceAsString());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Admin update quotation pricing and send back to client
    public function updatePricing(Request $request, $id)
    {
        $quotation = Quotation::with('items')->find($id);

        if (!$quotation) {
            return response()->json(['error' => 'Quotation not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'items' => 'required|array',
            'items.*.id' => 'required|numeric',
            'items.*.unit_price' => 'required|numeric',
            'items.*.line_total' => 'required|numeric',
            'subtotal' => 'required|numeric|min:0',
            'discount' => 'required|numeric|min:0',
            'total' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // Update quotation items with new pricing
            foreach ($request->items as $itemData) {
                $item = QuotationItem::find($itemData['id']);
                if ($item) {
                    $item->update([
                        'unit_price' => $itemData['unit_price'],
                        'line_total' => $itemData['line_total'],
                    ]);
                }
            }

            // Use the exact subtotal, discount, and total from frontend
            // This ensures what the admin sets in the UI is exactly what gets saved to the database
            $subtotal = $request->subtotal;
            $discount = $request->discount;
            $total = $request->total;

            // Update quotation with pricing from frontend and mark as has_price = 1
            $quotation->update([
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => $total,
                'has_price' => 1,
            ]);

            Log::info('Quotation pricing updated', [
                'quotation_id' => $id,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => $total,
            ]);

            $quotation->load(['customer', 'items']);

            return response()->json([
                'message' => 'Quotation pricing updated and sent back to client',
                'quotation' => $quotation,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to update quotation pricing', [
                'quotation_id' => $id,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'Failed to update quotation pricing: ' . $e->getMessage()], 500);
        }
    }

    public function uploadDesignFile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'design_file' => 'required|file|mimes:pdf,jpeg,png,jpg,gif,ai,psd,cdr,eps|max:10240',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $file = $request->file('design_file');
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            
            // Ensure the quotations/items directory exists
            $itemsDir = storage_path('app/public/quotations/items');
            if (!is_dir($itemsDir)) {
                @mkdir($itemsDir, 0755, true);
            }
            
            $path = $file->storeAs('quotations/items', $filename, 'public');
            
            return response()->json([
                'message' => 'Design file uploaded successfully',
                'design_file_url' => 'api/storage/app/public/quotations/items/' . $filename,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Design file upload error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function sendForProduction($id)
    {
        try {
            $quotation = Quotation::find($id);

            if (!$quotation) {
                return response()->json(['error' => 'Quotation not found'], 404);
            }

            // Update status to sent
            $quotation->status = 'sent';
            $quotation->save();

            return response()->json([
                'message' => 'Quotation sent for production successfully',
                'data' => $quotation,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Send for production error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Update quotation payment and status
    public function updatePayment(Request $request, $id)
    {
        try {
            $quotation = Quotation::find($id);

            if (!$quotation) {
                return response()->json(['error' => 'Quotation not found'], 404);
            }

            // Validation (only validate if fields are present)
            $validator = Validator::make($request->all(), [
                'paid_amount' => 'nullable|numeric|min:0',
                'status' => 'nullable|in:approved,pending,draft,sent',
                'notes' => 'nullable|string',
                'discount' => 'nullable|numeric|min:0',
                'tax' => 'nullable|numeric|min:0',
                'total' => 'nullable|numeric|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            // Allowed fields for update
            $allowedFields = [
                'paid_amount',
                'status',
                'notes',
                'discount',
                'tax',
                'total'
            ];

            $updateData = [];

            foreach ($allowedFields as $field) {
                if ($request->has($field)) {
                    $updateData[$field] = $request->input($field);
                }
            }

            if (empty($updateData)) {
                return response()->json(['error' => 'No valid fields to update'], 400);
            }

            // Update quotation
            $quotation->update($updateData);

            Log::info('Quotation payment updated', [
                'quotation_id' => $id,
                'updated_fields' => $updateData,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Quotation updated successfully',
                'data' => $quotation,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Update payment error', [
                'quotation_id' => $id,
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Failed to update payment',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Reject quotation and add rejection message
    public function rejectQuotation(Request $request, $id)
    {
        try {
            $quotation = Quotation::find($id);

            if (!$quotation) {
                return response()->json(['error' => 'Quotation not found'], 404);
            }

            $validator = Validator::make($request->all(), [
                'status' => 'required|in:rejected',
                'rejection_message' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            // Update quotation status to rejected
            $quotation->update([
                'status' => 'rejected',
                'notes' => $request->rejection_message ?? $quotation->notes,
            ]);

            Log::info('Quotation rejected', [
                'quotation_id' => $id,
                'rejection_message' => $request->rejection_message,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Quotation has been rejected',
                'data' => $quotation,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Reject quotation error', [
                'quotation_id' => $id,
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Failed to reject quotation',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Convert quotation to order
    public function convertToOrder(Request $request, $id)
    {
        try {
            Log::info('[v0] Converting quotation to order', [
                'quotation_id' => $id,
                'request_data' => $request->all()
            ]);

            $quotation = Quotation::with(['customer', 'items.service', 'branch'])->find($id);

            if (!$quotation) {
                Log::error('[v0] Quotation not found for conversion', ['quotation_id' => $id]);
                return response()->json(['error' => 'Quotation not found'], 404);
            }

            // Check if quotation is already ordered
            if ($quotation->status === 'ordered') {
                Log::warning('[v0] Quotation already converted to order', ['quotation_id' => $id]);
                return response()->json(['error' => 'Quotation has already been converted to an order'], 400);
            }

            // Generate order number
            $today = Carbon::today()->format('Ymd');
            $lastOrder = \App\Models\Order::whereDate('created_at', Carbon::today())
                ->orderBy('id', 'desc')
                ->first();
            
            if ($lastOrder) {
                preg_match('/ORD-\d+-(\d+)$/', $lastOrder->order_number, $matches);
                $sequenceNumber = isset($matches[1]) ? intval($matches[1]) + 1 : 1;
            } else {
                $sequenceNumber = 1;
            }
            
            $orderNumber = 'ORD-' . $today . '-' . str_pad($sequenceNumber, 5, '0', STR_PAD_LEFT);

            Log::info('[v0] Creating order with number', ['order_number' => $orderNumber]);

            // Parse and validate the remaining_balance as a float
            $remainingBalance = floatval($request->remaining_balance ?? $quotation->total);
            $paymentStatus = $request->payment_status ?? 'partial';
            $paymentMethod = $request->payment_method ?? 'cash';

            // Create the order
            $order = \App\Models\Order::create([
                'order_number' => $orderNumber,
                'quotation_id' => $quotation->id,
                'customer_id' => $quotation->customer_id,
                'created_by' => auth()->id(),
                'branch_id' => $quotation->branch_id,
                'order_date' => Carbon::now(),
                'subtotal' => $quotation->subtotal,
                'discount' => $quotation->discount,
                'total' => $quotation->total,
                'payment_status' => $paymentStatus,
                'order_status' => 'pending',
                'payment_method' => $paymentMethod,
                'remaining_balance' => $remainingBalance,
                'notes' => $quotation->notes,
            ]);

            Log::info('[v0] Order created successfully', ['order_id' => $order->id]);

            // Create order items from quotation items
            foreach ($quotation->items as $item) {
                // Handle JSON fields properly - convert to JSON string if they are arrays
                $teamRoster = $item->team_roster;
                if (is_array($teamRoster)) {
                    $teamRoster = json_encode($teamRoster);
                }
                
                $sizeSpecifications = $item->size_specifications;
                if (is_array($sizeSpecifications)) {
                    $sizeSpecifications = json_encode($sizeSpecifications);
                }
                
                \App\Models\OrderItem::create([
                    'order_id' => $order->id,
                    'service_id' => $item->service_id,
                    'quotation_items_id' => $item->id,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'line_total' => $item->line_total,
                    'design_file_url' => $item->design_file_url,
                    'notes' => is_array($item->notes) ? json_encode($item->notes) : $item->notes,
                    'team_roster' => $teamRoster,
                    'size_specifications' => $sizeSpecifications,
                    'status' => 'pending',
                ]);
            }

            Log::info('[v0] Order items created', ['count' => count($quotation->items)]);

            // Generate job order number
            $lastJobOrder = \App\Models\JobOrder::whereDate('created_at', Carbon::today())
                ->orderBy('id', 'desc')
                ->first();
            
            if ($lastJobOrder) {
                preg_match('/JO-\d+-(\d+)$/', $lastJobOrder->job_order_number, $joMatches);
                $joSequence = isset($joMatches[1]) ? intval($joMatches[1]) + 1 : 1;
            } else {
                $joSequence = 1;
            }
            
            $jobOrderNumber = 'JO-' . $today . '-' . str_pad($joSequence, 5, '0', STR_PAD_LEFT);

            // Create job order - Auto-assign to current admin user
            $jobOrder = \App\Models\JobOrder::create([
                'job_order_number' => $jobOrderNumber,
                'order_id' => $order->id,
                'customer_id' => $quotation->customer_id,
                'assigned_to' => auth()->id(),
                'status' => 'pending',
                'start_date' => $request->start_date ? Carbon::parse($request->start_date) : Carbon::now(),
                'due_date' => $request->due_date ? Carbon::parse($request->due_date) : Carbon::now()->addDays(7),
                'is_priority' => $request->is_priority ?? 0,
                'notes' => $request->notes ?? 'Order sent to warehouse for production processing. Please follow the schedule and quality standards.',
            ]);

            Log::info('[v0] Job order created', ['job_order_id' => $jobOrder->id, 'job_order_number' => $jobOrderNumber]);

            // Update quotation status to 'approved' (since it has been converted to an order)
            $quotation->status = 'approved';
            $quotation->save();

            Log::info('[v0] Quotation status updated to approved');

            return response()->json([
                'success' => true,
                'message' => 'Quotation successfully converted to order',
                'order' => $order->load(['customer', 'items', 'branch']),
                'job_order' => $jobOrder,
            ], 201);

        } catch (\Exception $e) {
            Log::error('[v0] Convert to order error', [
                'quotation_id' => $id,
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Failed to convert quotation to order',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Get all active branches for sending quotations
    public function getActiveBranches()
    {
        try {
            Log::info('Getting active branches - Request started');

            $branches = \App\Models\Branch::where('status', 'active')
                ->select('id', 'name', 'location', 'address', 'phone_number', 'email', 'is_main_branch')
                ->orderBy('is_main_branch', 'desc')
                ->orderBy('name', 'asc')
                ->get();

            Log::info('Active branches fetched successfully', [
                'count' => $branches->count(),
                'data' => $branches->toArray(),
            ]);

            // Return as array directly (frontend expects this format)
            return response()->json($branches, 200);

        } catch (\Exception $e) {
            Log::error('Get active branches error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Failed to fetch branches',
                'message' => $e->getMessage(),
                'debug' => config('app.debug') ? $e->getTraceAsString() : null
            ], 500);
        }
    }
}
