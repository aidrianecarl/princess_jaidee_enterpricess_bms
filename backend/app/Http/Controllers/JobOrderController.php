<?php

namespace App\Http\Controllers;

use App\Models\JobOrder;
use App\Models\JobOrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class JobOrderController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = JobOrder::with(['assignedTo', 'customer', 'items.product', 'items.service']);

            if ($request->has('search')) {
                $query->where('job_order_number', 'like', '%' . $request->search . '%');
            }

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            $jobOrders = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'data' => $jobOrders,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching job orders: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch job orders', 'message' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        try {
            $jobOrder = JobOrder::with(['assignedTo', 'customer', 'items.product', 'items.service'])->find($id);

            if (!$jobOrder) {
                return response()->json(['error' => 'Job Order not found'], 404);
            }

            return response()->json($jobOrder, 200);
        } catch (\Exception $e) {
            Log::error('Error fetching job order: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch job order'], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'quotation_id' => 'required|exists:quotations,id',
            'assigned_to_id' => 'required|exists:users,id',
            'start_date' => 'required|date',
            'due_date' => 'required|date|after:start_date',
            'items' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $jobNumber = 'JO-' . date('Ymd') . '-' . str_pad(JobOrder::count() + 1, 5, '0', STR_PAD_LEFT);

            $jobOrder = JobOrder::create([
                'job_order_number' => $jobNumber,
                'quotation_id' => $request->quotation_id,
                'assigned_to' => $request->assigned_to_id,
                'start_date' => $request->start_date,
                'due_date' => $request->due_date,
                'status' => 'pending',
                'notes' => $request->notes ?? null,
            ]);

            // Create job order items from quotation items
            if ($request->has('items')) {
                foreach ($request->items as $item) {
                    JobOrderItem::create([
                        'job_order_id' => $jobOrder->id,
                        'product_id' => $item['product_id'] ?? null,
                        'service_id' => $item['service_id'] ?? null,
                        'description' => $item['description'] ?? null,
                        'quantity' => $item['quantity'] ?? 1,
                        'unit_price' => $item['unit_price'] ?? 0,
                        'line_total' => ($item['quantity'] ?? 1) * ($item['unit_price'] ?? 0),
                        'completed' => false,
                    ]);
                }
            }

            $jobOrder->load(['assignedTo', 'customer', 'items.product', 'items.service']);

            return response()->json([
                'message' => 'Job Order created successfully',
                'jobOrder' => $jobOrder,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Job Order creation error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function completeItem(Request $request, $jobOrderId)
    {
        $validator = Validator::make($request->all(), [
            'item_id' => 'required|exists:job_order_items,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $jobOrder = JobOrder::findOrFail($jobOrderId);
            $item = JobOrderItem::findOrFail($request->item_id);

            if ($item->job_order_id !== $jobOrder->id) {
                return response()->json(['error' => 'Item does not belong to this job order'], 422);
            }

            // Mark item as completed
            $item->update([
                'completed' => true,
                'completed_at' => now(),
            ]);

            // Reduce product stock if applicable
            if ($item->product_id) {
                $product = Product::find($item->product_id);
                if ($product) {
                    $product->decrement('quantity_in_stock', $item->quantity);
                    Log::info('Product stock reduced', [
                        'product_id' => $item->product_id,
                        'quantity' => $item->quantity,
                    ]);
                }
            }

            $item->load(['product', 'service']);

            return response()->json([
                'message' => 'Item marked as complete',
                'item' => $item,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error marking item complete: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        $jobOrder = JobOrder::find($id);

        if (!$jobOrder) {
            return response()->json(['error' => 'Job Order not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,in_progress,on_hold,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            if ($request->status === 'completed') {
                // Mark all uncompleted items as completed and reduce stock
                $items = JobOrderItem::where('job_order_id', $id)->where('completed', false)->get();
                
                foreach ($items as $item) {
                    $item->update([
                        'completed' => true,
                        'completed_at' => now(),
                    ]);

                    // Reduce product stock
                    if ($item->product_id) {
                        $product = Product::find($item->product_id);
                        if ($product) {
                            $product->decrement('quantity_in_stock', $item->quantity);
                        }
                    }
                }

                // Set completed date
                $jobOrder->update([
                    'status' => $request->status,
                    'completed_date' => now(),
                ]);
            } else {
                $jobOrder->update(['status' => $request->status]);
            }

            $jobOrder->load(['assignedTo', 'customer', 'items.product', 'items.service']);

            return response()->json([
                'message' => 'Job Order updated successfully',
                'jobOrder' => $jobOrder,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error updating job order status: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        $jobOrder = JobOrder::find($id);

        if (!$jobOrder) {
            return response()->json(['error' => 'Job Order not found'], 404);
        }

        // Delete associated items
        JobOrderItem::where('job_order_id', $id)->delete();
        $jobOrder->delete();

        return response()->json([
            'message' => 'Job Order deleted successfully',
        ], 200);
    }
}
