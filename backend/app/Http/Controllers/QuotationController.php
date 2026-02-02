<?php

namespace App\Http\Controllers;

use App\Models\Quotation;
use App\Models\QuotationItem;
use App\Models\Customer;
use App\Models\User;
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
        
        $query = Quotation::with(['customer', 'items.product', 'items.service'])
            ->whereHas('creator', function ($q) use ($userId) {
                $q->where('id', $userId);
            });

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

    // Get single quotation
    public function show($id)
    {
        $quotation = Quotation::with(['customer', 'items.product', 'items.service'])->find($id);

        if (!$quotation) {
            return response()->json(['error' => 'Quotation not found'], 404);
        }
        
        $quotation->items_count = $quotation->items->count();

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
            'business_name' => 'required|string',
            'business_address' => 'nullable|string',
            'business_city' => 'nullable|string',
            'business_state' => 'nullable|string',
            'business_postal' => 'nullable|string',
            'business_phone' => 'nullable|string',
            'business_email' => 'nullable|email',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|integer',
            'items.*.service_id' => 'nullable|integer',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.customization' => 'nullable|string',
            'items.*.design_cost' => 'nullable|numeric|min:0',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'discount' => 'nullable|numeric|min:0',
            'paid_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'valid_until' => 'nullable|date',
            'status' => 'nullable|in:draft,pending_approval',
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
            
            // Get or create customer
            $customer = Customer::where('user_id', $userId)->first();
            if (!$customer) {
                $customer = Customer::create([
                    'user_id' => $userId,
                    'company_name' => $request->customer_name,
                    'contact_person' => $request->customer_name,
                    'email' => $request->customer_email,
                    'phone_number' => $request->customer_phone,
                    'address' => $request->customer_address,
                    'city' => $request->customer_city,
                    'province' => $request->customer_province,
                    'zip_code' => $request->customer_zip_code,
                    'customer_type' => 'registered',
                    'status' => 'active',
                ]);
            } else {
                // Update customer info
                $customer->update([
                    'company_name' => $request->customer_name,
                    'contact_person' => $request->customer_name,
                    'email' => $request->customer_email,
                    'phone_number' => $request->customer_phone,
                    'address' => $request->customer_address,
                    'city' => $request->customer_city,
                    'province' => $request->customer_province,
                    'zip_code' => $request->customer_zip_code,
                ]);
            }

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
                            $logoUrl = Storage::disk('public')->url($path);
                            
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

            $subtotal = 0;
            foreach ($request->items as $item) {
                $lineTotal = ($item['quantity'] ?? 0) * ($item['unit_price'] ?? 0);
                if (isset($item['design_cost'])) {
                    $lineTotal += $item['design_cost'];
                }
                $subtotal += $lineTotal;
            }

            $discount = $request->discount ?? 0;
            $discountAmount = 0;
            $tax = 0;
            $total = $subtotal;
            $paidAmount = $request->paid_amount ?? 0;

            $status = $request->status ?? 'draft';

            $quotation = Quotation::create([
                'quotation_number' => $quotationNumber,
                'customer_id' => $customer->id,
                'created_by' => $userId,
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
                'tax' => $tax,
                'total' => $total,
                'currency' => 'PHP',
                'status' => $status,
                'notes' => $request->notes,
                'valid_until' => $request->valid_until,
            ]);

            foreach ($request->items as $item) {
                $lineTotal = ($item['quantity'] ?? 0) * ($item['unit_price'] ?? 0);
                if (isset($item['design_cost'])) {
                    $lineTotal += $item['design_cost'];
                }

                QuotationItem::create([
                    'quotation_id' => $quotation->id,
                    'product_id' => !empty($item['product_id']) ? $item['product_id'] : null,
                    'service_id' => !empty($item['service_id']) ? $item['service_id'] : null,
                    'description' => $item['customization'] ?? $item['description'] ?? null,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'design_cost' => $item['design_cost'] ?? 0,
                    'line_total' => $lineTotal,
                    'design_file_url' => $item['design_file_url'] ?? null,
                    'team_roster' => !empty($item['team_roster']) ? json_encode($item['team_roster']) : null,
                    'size_specifications' => !empty($item['size_specifications']) ? json_encode($item['size_specifications']) : null,
                ]);
            }
            
            $quotation->load(['customer', 'items.product', 'items.service']);
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
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'notes' => 'nullable|string',
            'valid_until' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // Update customer if provided
            if ($request->has('customer_name')) {
                $quotation->customer->update([
                    'company_name' => $request->customer_name,
                    'contact_person' => $request->customer_name,
                    'email' => $request->customer_email,
                    'phone_number' => $request->customer_phone,
                    'address' => $request->customer_address,
                    'city' => $request->customer_city,
                    'province' => $request->customer_province,
                    'zip_code' => $request->customer_zip_code,
                ]);
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
                        $quotation->logo_url = Storage::disk('public')->url($path);
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
                
                $subtotal = 0;
                foreach ($request->items as $item) {
                    $lineTotal = ($item['quantity'] ?? 0) * ($item['unit_price'] ?? 0);
                    if (isset($item['design_cost'])) {
                        $lineTotal += $item['design_cost'];
                    }
                    $subtotal += $lineTotal;

                    QuotationItem::create([
                        'quotation_id' => $quotation->id,
                        'product_id' => !empty($item['product_id']) ? $item['product_id'] : null,
                        'service_id' => !empty($item['service_id']) ? $item['service_id'] : null,
                        'description' => $item['customization'] ?? $item['description'] ?? null,
                        'quantity' => $item['quantity'],
                        'unit_price' => $item['unit_price'],
                        'design_cost' => $item['design_cost'] ?? 0,
                        'line_total' => $lineTotal,
                        'design_file_url' => $item['design_file_url'] ?? null,
                        'team_roster' => !empty($item['team_roster']) ? json_encode($item['team_roster']) : null,
                        'size_specifications' => !empty($item['size_specifications']) ? json_encode($item['size_specifications']) : null,
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

            // Update other fields
            if ($request->has('notes')) {
                $quotation->notes = $request->notes;
            }
            
            if ($request->has('valid_until')) {
                $quotation->valid_until = $request->valid_until;
            }

            $quotation->save();
            $quotation->load(['customer', 'items.product', 'items.service']);
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

    // Admin view all pending quotations
    public function adminIndex(Request $request)
    {
        $query = Quotation::with(['customer', 'items.product', 'items.service', 'creator']);
        
        if ($request->has('search')) {
            $query->where('quotation_number', 'like', '%' . $request->search . '%');
        }
        
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }
        
        $quotations = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 15);
        
        $quotations->getCollection()->transform(function ($quotation) {
            $quotation->items_count = $quotation->items->count();
            return $quotation;
        });

        return response()->json($quotations, 200);
    }

    // Admin view single quotation
    public function adminShow($id)
    {
        $quotation = Quotation::with(['customer', 'items.product', 'items.service', 'creator'])->find($id);

        if (!$quotation) {
            return response()->json(['error' => 'Quotation not found'], 404);
        }

        return response()->json($quotation, 200);
    }
}
