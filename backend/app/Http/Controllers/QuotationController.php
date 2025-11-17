<?php

namespace App\Http\Controllers;

use App\Models\Quotation;
use App\Models\QuotationItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class QuotationController extends Controller
{
    // Get all quotations
    public function index(Request $request)
    {
        $query = Quotation::with(['user', 'items']);

        if ($request->has('search')) {
            $query->where('quotation_number', 'like', '%' . $request->search . '%')
                  ->orWhere('client_name', 'like', '%' . $request->search . '%');
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $quotations = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 15);

        return response()->json($quotations, 200);
    }

    // Get single quotation
    public function show($id)
    {
        $quotation = Quotation::with(['user', 'items'])->find($id);

        if (!$quotation) {
            return response()->json(['error' => 'Quotation not found'], 404);
        }

        return response()->json($quotation, 200);
    }

    // Create quotation
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'client_name' => 'required|string',
            'client_email' => 'nullable|email',
            'client_phone' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.service_id' => 'nullable|exists:services,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            'notes' => 'nullable|string',
            'expiry_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $quotationNumber = 'QT-' . date('Ymd') . '-' . str_pad(Quotation::count() + 1, 5, '0', STR_PAD_LEFT);

            $totalAmount = 0;
            foreach ($request->items as $item) {
                $totalAmount += $item['quantity'] * $item['unit_price'];
            }

            $discountAmount = ($request->discount_percent ?? 0) * $totalAmount / 100;
            $netAmount = $totalAmount - $discountAmount;

            $quotation = Quotation::create([
                'quotation_number' => $quotationNumber,
                'user_id' => auth()->id(),
                'client_name' => $request->client_name,
                'client_email' => $request->client_email,
                'client_phone' => $request->client_phone,
                'total_amount' => $totalAmount,
                'discount_percent' => $request->discount_percent ?? 0,
                'discount_amount' => $discountAmount,
                'net_amount' => $netAmount,
                'notes' => $request->notes,
                'expiry_date' => $request->expiry_date,
                'status' => 'draft',
            ]);

            // Add items
            foreach ($request->items as $item) {
                QuotationItem::create([
                    'quotation_id' => $quotation->id,
                    'product_id' => $item['product_id'] ?? null,
                    'service_id' => $item['service_id'] ?? null,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $item['quantity'] * $item['unit_price'],
                ]);
            }

            return response()->json([
                'message' => 'Quotation created successfully',
                'quotation' => $quotation->load('items'),
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
            'status' => 'required|in:draft,sent,approved,rejected,expired',
            'scheduled_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $quotation->update([
            'status' => $request->status,
            'scheduled_date' => $request->scheduled_date,
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
