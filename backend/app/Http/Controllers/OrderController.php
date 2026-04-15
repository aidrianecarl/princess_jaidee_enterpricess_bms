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
            // For admin users - fetch all orders
            Log::info('[v0] OrderController index - Fetching all orders', ['request' => $request->all()]);
            
            $query = Order::with(['customer', 'items', 'quotation']);

            if ($request->has('search')) {
                Log::info('[v0] OrderController - Applying search filter:', ['search' => $request->search]);
                $query->where('order_number', 'like', '%' . $request->search . '%');
            }

            if ($request->has('status')) {
                Log::info('[v0] OrderController - Applying status filter:', ['status' => $request->status]);
                $query->where('order_status', $request->status);
            }

            $orders = $query->orderBy('created_at', 'desc')->get();
            
            Log::info('[v0] Orders fetched successfully:', ['count' => $orders->count(), 'data_sample' => $orders->take(1)->toArray()]);

            return response()->json([
                'success' => true,
                'data' => $orders,
                'count' => $orders->count()
            ], 200);
        } catch (\Exception $e) {
            Log::error('[v0] Error fetching orders:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch orders',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            Log::info('OrderController show - Fetching order ID: ' . $id);
            
            // Load order with all relationships including items with service details
            $order = Order::with([
                'customer',
                'items.service',
                'quotation'
            ])->find($id);

            if (!$order) {
                Log::warning('Order not found: ' . $id);
                return response()->json(['error' => 'Order not found'], 404);
            }

            Log::info('Order found', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'items_count' => $order->items ? count($order->items) : 0
            ]);

            return response()->json([
                'success' => true,
                'data' => $order
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching order: ' . $e->getMessage(), [
                'order_id' => $id,
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine()
            ]);
            return response()->json([
                'error' => 'Failed to fetch order details',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        Log::info('[v0] OrderController store - Request data:', $request->all());
        
        $validator = Validator::make($request->all(), [
            'quotation_id' => 'nullable|exists:quotations,id',
            'customer_id' => 'required|numeric',
            'order_date' => 'required|date',
            'subtotal' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'payment_status' => 'nullable|in:unpaid,partial,paid,pending',
            'order_status' => 'nullable|in:pending,processing,completed,shipped,delivered,cancelled',
            'payment_method' => 'required|in:cash,gcash,credit_card,bank_transfer,check',
            'remaining_balance' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            Log::error('[v0] OrderController validation failed:', ['errors' => $validator->errors()]);
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $orderNumber = 'ORD-' . date('Ymd') . '-' . str_pad(Order::count() + 1, 5, '0', STR_PAD_LEFT);
            
            Log::info('[v0] Creating order with number: ' . $orderNumber);

            // Calculate remaining balance based on payment status
            $paymentStatus = $request->payment_status ?? 'unpaid';
            $remainingBalance = $request->remaining_balance ?? 0;
            
            // If payment_status is 'paid', remaining balance is 0
            if ($paymentStatus === 'paid') {
                $remainingBalance = 0;
            }
            
            $order = Order::create([
                'order_number' => $orderNumber,
                'quotation_id' => $request->quotation_id,
                'customer_id' => $request->customer_id,
                'created_by' => auth()->id(),
                'order_date' => $request->order_date,
                'subtotal' => $request->subtotal,
                'discount' => $request->discount ?? 0,
                'total' => $request->total,
                'payment_status' => $paymentStatus,
                'order_status' => $request->order_status ?? 'pending',
                'payment_method' => $request->payment_method,
                'remaining_balance' => $remainingBalance,
                'notes' => $request->notes,
            ]);
            
            Log::info('[v0] Order created successfully:', ['order_id' => $order->id, 'order_number' => $orderNumber]);

            // Note: Order items are created separately via the order-items endpoint
            // This prevents duplicate items when the frontend explicitly creates them

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => $order->load('items'),
            ], 201);
        } catch (\Exception $e) {
            Log::error('[v0] Order creation error:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to create order'
            ], 500);
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

        // Update order_status and payment_status
        $updateData = [];
        if ($request->has('status')) {
            $updateData['order_status'] = $request->status;
        }
        if ($request->has('payment_status')) {
            $updateData['payment_status'] = $request->payment_status;
        }

        $order->update($updateData);

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

    public function adminIndex(Request $request)
    {
        try {
            Log::info('[v0] OrderController adminIndex - Fetching all orders for admin');
            
            $query = Order::with(['customer', 'items', 'quotation', 'creator']);

            if ($request->has('search')) {
                Log::info('[v0] OrderController - Applying search filter:', ['search' => $request->search]);
                $query->where('order_number', 'like', '%' . $request->search . '%');
            }

            if ($request->has('status')) {
                Log::info('[v0] OrderController - Applying status filter:', ['status' => $request->status]);
                $query->where('order_status', $request->status);
            }

            if ($request->has('payment_status')) {
                Log::info('[v0] OrderController - Applying payment status filter:', ['payment_status' => $request->payment_status]);
                $query->where('payment_status', $request->payment_status);
            }

            $orders = $query->orderBy('created_at', 'desc')->get();
            
            Log::info('[v0] Orders fetched successfully for admin:', ['count' => $orders->count()]);

            return response()->json([
                'success' => true,
                'data' => $orders,
                'count' => $orders->count()
            ], 200);
        } catch (\Exception $e) {
            Log::error('[v0] Error fetching admin orders:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch orders',
                'error' => $e->getMessage()
            ], 500);
        }
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

    public function updatePaymentStatus(Request $request, $id)
    {
        try {
            Log::info('[v0] OrderController updatePaymentStatus - Order ID: ' . $id, ['request' => $request->all()]);
            
            $order = Order::find($id);
            
            if (!$order) {
                Log::warning('[v0] Order not found for payment status update: ' . $id);
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'payment_status' => 'required|in:unpaid,partial,paid',
                'remaining_balance' => 'nullable|numeric|min:0',
            ]);

            if ($validator->fails()) {
                Log::error('[v0] Validation failed for payment status update:', ['errors' => $validator->errors()]);
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $paymentStatus = $request->payment_status;
            $remainingBalance = $request->remaining_balance ?? 0;

            // If payment status is 'paid', remaining balance must be 0
            if ($paymentStatus === 'paid') {
                $remainingBalance = 0;
            }

            $order->update([
                'payment_status' => $paymentStatus,
                'remaining_balance' => $remainingBalance,
            ]);

            Log::info('[v0] Payment status updated successfully:', [
                'order_id' => $order->id,
                'payment_status' => $paymentStatus,
                'remaining_balance' => $remainingBalance
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment status updated successfully',
                'data' => $order,
            ], 200);
        } catch (\Exception $e) {
            Log::error('[v0] Error updating payment status:', [
                'order_id' => $id,
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to update payment status',
                'error' => $e->getMessage()
            ], 500);
        }
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
            'quotation_items_id' => 'nullable|exists:quotation_items,id',
            'description' => 'nullable|string',
            'quantity' => 'required|integer|min:1',
            'unit_price' => 'required|numeric|min:0',
            'line_total' => 'nullable|numeric|min:0',
            'design_file_url' => 'nullable|string',
            'team_roster' => 'nullable|string',
            'size_specifications' => 'nullable|string',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:pending,ongoing,completed',
        ]);

        if ($validator->fails()) {
            \Log::error('Order item validation failed', ['errors' => $validator->errors()]);
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            \Log::info('Creating order item', $request->all());
            
            $item = OrderItem::create([
                'order_id' => $request->order_id,
                'service_id' => $request->service_id,
                'quotation_items_id' => $request->quotation_items_id ?? null,
                'quantity' => $request->quantity,
                'unit_price' => $request->unit_price,
                'line_total' => $request->line_total ?? ($request->quantity * $request->unit_price),
                'design_file_url' => $request->design_file_url ?? null,
                'team_roster' => $request->team_roster ?? null,
                'size_specifications' => $request->size_specifications ?? null,
                'notes' => $request->notes ?? null,
                'status' => $request->status ?? 'pending',
            ]);

            \Log::info('Order item created', ['item_id' => $item->id, 'order_id' => $request->order_id]);

            return response()->json([
                'success' => true,
                'message' => 'Order item created successfully',
                'data' => $item,
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Order item creation error: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'success' => false,
                'error' => 'Failed to create order item',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function updateOrderItem(Request $request, $id)
    {
        try {
            $item = OrderItem::find($id);

            if (!$item) {
                \Log::warning('Order item not found: ' . $id);
                return response()->json(['error' => 'Order item not found'], 404);
            }

            $validator = Validator::make($request->all(), [
                'status' => 'nullable|in:pending,ongoing,completed',
                'quantity' => 'nullable|integer|min:1',
                'unit_price' => 'nullable|numeric|min:0',
                'line_total' => 'nullable|numeric|min:0',
                'design_file_url' => 'nullable|string',
                'team_roster' => 'nullable|string|json',
                'size_specifications' => 'nullable|string|json',
                'notes' => 'nullable|string|json',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            \Log::info('Updating order item', ['item_id' => $id, 'data' => $request->all()]);

            $updateData = [
                'status' => $request->status ?? $item->status,
                'quantity' => $request->quantity ?? $item->quantity,
                'unit_price' => $request->unit_price ?? $item->unit_price,
                'line_total' => $request->line_total ?? $item->line_total,
            ];

            // Add new fields if provided
            if ($request->has('design_file_url')) {
                $updateData['design_file_url'] = $request->design_file_url;
            }
            if ($request->has('team_roster')) {
                $updateData['team_roster'] = $request->team_roster;
            }
            if ($request->has('size_specifications')) {
                $updateData['size_specifications'] = $request->size_specifications;
            }
            if ($request->has('notes')) {
                $updateData['notes'] = $request->notes;
            }

            $item->update($updateData);

            \Log::info('Order item updated successfully', ['item_id' => $id]);

            return response()->json([
                'success' => true,
                'message' => 'Order item updated successfully',
                'data' => $item,
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Order item update error: ' . $e->getMessage(), ['item_id' => $id, 'exception' => $e]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
