<?php

namespace App\Http\Controllers;

use App\Models\Quotation;
use App\Models\QuotationItem;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class QuotationController extends Controller
{
    // Get all quotations for authenticated user
    public function index(Request $request)
    {
        $userId = auth()->id();
        
        $query = Quotation::with(['customer', 'items'])
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

        return response()->json($quotations, 200);
    }

    // Get single quotation
    public function show($id)
    {
        $quotation = Quotation::with(['customer', 'items'])->find($id);

        if (!$quotation) {
            return response()->json(['error' => 'Quotation not found'], 404);
        }

        return response()->json($quotation, 200);
    }

    // Create quotation
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_name' => 'required|string',
            'customer_email' => 'nullable|email',
            'customer_phone' => 'nullable|string',
            'customer_address' => 'nullable|string',
            'customer_city' => 'nullable|string',
            'customer_province' => 'nullable|string',
            'customer_zip_code' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.service_id' => 'nullable|exists:services,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.customization' => 'nullable|string',
            'items.*.design_cost' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0|max:100',
            'notes' => 'nullable|string',
            'valid_until' => 'nullable|date',
        ]);

        if ($validator->fails()) {
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

            $quotationNumber = 'QT-' . date('Ymd') . '-' . str_pad(Quotation::count() + 1, 5, '0', STR_PAD_LEFT);

            $subtotal = 0;
            foreach ($request->items as $item) {
                $lineTotal = $item['quantity'] * $item['unit_price'];
                if (isset($item['design_cost'])) {
                    $lineTotal += $item['design_cost'];
                }
                $subtotal += $lineTotal;
            }

            $discount = ($request->discount ?? 0);
            $discountAmount = ($discount / 100) * $subtotal;
            $tax = 0; // Can be calculated based on business rules
            $total = $subtotal - $discountAmount + $tax;

            $quotation = Quotation::create([
                'quotation_number' => $quotationNumber,
                'customer_id' => $customer->id,
                'created_by' => $userId,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'tax' => $tax,
                'total' => $total,
                'currency' => 'PHP',
                'status' => 'draft',
                'notes' => $request->notes,
                'valid_until' => $request->valid_until,
            ]);

            // Add items
            foreach ($request->items as $item) {
                $lineTotal = $item['quantity'] * $item['unit_price'];
                if (isset($item['design_cost'])) {
                    $lineTotal += $item['design_cost'];
                }

                QuotationItem::create([
                    'quotation_id' => $quotation->id,
                    'product_id' => $item['product_id'] ?? null,
                    'service_id' => $item['service_id'] ?? null,
                    'description' => $item['customization'] ?? null,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'line_total' => $lineTotal,
                ]);
            }

            return response()->json([
                'message' => 'Quotation created successfully',
                'quotation' => $quotation->load(['customer', 'items']),
            ], 201);
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
            'status' => 'required|in:draft,pending,approved,rejected,expired',
            'scheduled_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $quotation->update([
            'status' => $request->status,
            'scheduled_send_date' => $request->scheduled_date,
        ]);

        return response()->json([
            'message' => 'Quotation status updated',
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
}
