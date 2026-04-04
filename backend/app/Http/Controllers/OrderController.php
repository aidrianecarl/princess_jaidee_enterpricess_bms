<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Quotation;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        try {
            $userId = auth()->id();
            
            Log::info('OrderController index - Fetching orders for user:', ['user_id' => $userId]);
            
            // Get all quotations created by this authenticated user
            $quotations = Quotation::where('created_by', $userId)->get();
            Log::info('Found quotations:', ['count' => $quotations->count(), 'quotations' => $quotations->pluck('id')]);
            
            // Extract all unique customer IDs from those quotations
            $customerIds = $quotations->pluck('customer_id')->unique()->filter()->values();
            Log::info('Customer IDs from quotations:', ['customer_ids' => $customerIds]);
            
            $query = Order::with(['customer', 'items', 'quotation']);

            // Filter orders by customer IDs
            if ($customerIds->count() > 0) {
                $query->whereIn('customer_id', $customerIds);
            } else {
                // If no quotations found for user, return empty
                Log::info('No quotations found for user, returning empty orders');
                return response()->json([
                    'success' => true,
                    'data' => []
                ], 200);
            }

            if ($request->has('search')) {
                $query->where('order_number', 'like', '%' . $request->search . '%');
            }

            if ($request->has('status')) {
                $query->where('payment_status', $request->status);
            }

            $orders = $query->orderBy('created_at', 'desc')->get();
            
            Log::info('Orders fetched:', ['count' => $orders->count()]);

            return response()->json([
                'success' => true,
                'data' => $orders
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching orders: ' . $e->getMessage(), ['user_id' => auth()->id()]);
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $order = Order::with(['user', 'items'])->find($id);

        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        return response()->json($order, 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'quotation_id' => 'nullable|exists:quotations,id',
            'customer_id' => 'required|exists:customers,id',
            'order_date' => 'required|date',
            'subtotal' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'payment_status' => 'nullable|in:unpaid,partial,paid',
            'order_status' => 'nullable|in:pending,processing,completed,shipped,delivered,cancelled',
            'payment_method' => 'required|in:cash,credit_card,bank_transfer,check',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $orderNumber = 'ORD-' . date('Ymd') . '-' . str_pad(Order::count() + 1, 5, '0', STR_PAD_LEFT);

            $order = Order::create([
                'order_number' => $orderNumber,
                'quotation_id' => $request->quotation_id,
                'customer_id' => $request->customer_id,
                'created_by' => auth()->id(),
                'order_date' => $request->order_date,
                'subtotal' => $request->subtotal,
                'discount' => $request->discount ?? 0,
                'tax' => $request->tax ?? 0,
                'total' => $request->total,
                'payment_status' => $request->payment_status ?? 'unpaid',
                'order_status' => $request->order_status ?? 'pending',
                'payment_method' => $request->payment_method,
                'notes' => $request->notes,
            ]);

            // If quotation_id is provided, copy quotation items to order_items
            if ($request->quotation_id) {
                $quotation = Quotation::with('items')->find($request->quotation_id);
                if ($quotation && $quotation->items) {
                    foreach ($quotation->items as $quotationItem) {
                        OrderItem::create([
                            'order_id' => $order->id,
                            'quotation_items_id' => $quotationItem->id,
                            'service_id' => $quotationItem->service_id,
                            'quantity' => $quotationItem->quantity,
                            'unit_price' => $quotationItem->unit_price,
                        ]);
                    }
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => $order->load('items'),
            ], 201);
        } catch (\Exception $e) {
            Log::error('Order creation error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,processing,completed,shipped,delivered,cancelled',
            'payment_status' => 'in:unpaid,partial,paid',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $order->update($request->only(['status', 'payment_status']));

        return response()->json([
            'message' => 'Order updated successfully',
            'order' => $order,
        ], 200);
    }

    public function destroy($id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        $order->items()->delete();
        $order->delete();

        return response()->json([
            'message' => 'Order deleted successfully',
        ], 200);
    }

    public function customerIndex(Request $request)
    {
        $query = Order::with(['customer', 'items'])
            ->where('customer_id', auth()->user()->customer_id ?? auth()->id());

        $orders = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $orders,
        ], 200);
    }

    public function getOrderItems(Request $request)
    {
        $items = OrderItem::with('order')->get();
        
        return response()->json([
            'success' => true,
            'data' => $items,
        ], 200);
    }

    public function storeOrderItem(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id',
            'service_id' => 'nullable|exists:services,id',
            'description' => 'nullable|string',
            'quantity' => 'required|integer|min:1',
            'unit_price' => 'required|numeric|min:0',
            'line_total' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $item = OrderItem::create([
                'order_id' => $request->order_id,
                'service_id' => $request->service_id,
                'description' => $request->description,
                'quantity' => $request->quantity,
                'unit_price' => $request->unit_price,
                'line_total' => $request->line_total,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Order item created successfully',
                'data' => $item,
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Order item creation error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
