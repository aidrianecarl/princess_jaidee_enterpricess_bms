<?php

namespace App\Http\Controllers;

use App\Models\JobOrder;
use App\Models\JobOrderItem;
use App\Models\Quotation;
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
            $query = JobOrder::with(['assignedTo', 'customer']);

            if ($request->has('search')) {
                $query->where('job_order_number', 'like', '%' . $request->search . '%');
            }

            if ($request->has('status')) {
                $status = $request->status === 'in_progress' ? 'in-progress' : $request->status;
                $query->where('status', $status);
            }

            $jobOrders = $query->orderBy('created_at', 'desc')->get();

            $jobOrders = $jobOrders->map(function($jobOrder) {
                $jobOrder->status = str_replace('-', '_', $jobOrder->status);
                return $jobOrder;
            });

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
            $jobOrder = JobOrder::with(['assignedTo', 'customer'])->find($id);

            if (!$jobOrder) {
                return response()->json(['error' => 'Job Order not found'], 404);
            }

            $jobOrder->status = str_replace('-', '_', $jobOrder->status);

            return response()->json($jobOrder, 200);
        } catch (\Exception $e) {
            Log::error('Error fetching job order: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch job order'], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'quotation_id' => 'nullable|exists:quotations,id',
            'order_id' => 'required|exists:orders,id',
            'customer_id' => 'required|exists:users,id',
            'assigned_to' => 'required|exists:users,id',
            'start_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:start_date',
            'notes' => 'nullable|string',
            'is_priority' => 'nullable|integer|in:0,1',
        ]);

        if ($validator->fails()) {
            Log::error('Job order validation failed', ['errors' => $validator->errors()]);
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            Log::info('Creating job order with payload:', $request->all());

            $jobNumber = 'JO-' . date('Ymd') . '-' . str_pad(JobOrder::count() + 1, 5, '0', STR_PAD_LEFT);

            $jobOrder = JobOrder::create([
                'job_order_number' => $jobNumber,
                'quotation_id' => $request->quotation_id ?? null,
                'order_id' => $request->order_id,
                'customer_id' => $request->customer_id,
                'assigned_to' => $request->assigned_to,
                'start_date' => $request->start_date,
                'due_date' => $request->due_date,
                'status' => 'pending',
                'notes' => $request->notes ?? null,
                'is_priority' => $request->is_priority ?? 0,
            ]);

            Log::info('Job order created successfully', [
                'job_order_id' => $jobOrder->id,
                'job_order_number' => $jobOrder->job_order_number,
                'order_id' => $request->order_id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Job order created successfully',
                'data' => $jobOrder->load(['assignedTo', 'customer', 'order'])
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating job order', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'success' => false,
                'error' => 'Failed to create job order',
                'message' => $e->getMessage()
            ], 500);
        }
    }



    public function updateStatus(Request $request, $id)
    {
        try {
            $jobOrder = JobOrder::find($id);

            if (!$jobOrder) {
                return response()->json(['error' => 'Job Order not found'], 404);
            }

            $validator = Validator::make($request->all(), [
                'status' => 'required|in:pending,in_progress,in-progress,on_hold,completed,cancelled',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $status = $request->status === 'in_progress' ? 'in-progress' : $request->status;

            if ($status === 'completed') {
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
                    'status' => $status,
                    'completed_date' => now(),
                ]);
            } else {
                $jobOrder->update(['status' => $status]);
                
                // Also update the related order status when job order status changes
                if ($jobOrder->order_id && $status === 'in-progress') {
                    $order = \App\Models\Order::find($jobOrder->order_id);
                    if ($order) {
                        $order->update(['order_status' => 'processing']);
                    }
                }
            }

            $jobOrder->load(['assignedTo', 'customer', 'items.product', 'items.service']);
            $jobOrder->status = str_replace('-', '_', $jobOrder->status);

            return response()->json([
                'message' => 'Job Order updated successfully',
                'jobOrder' => $jobOrder,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error updating job order status: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage(), 'debug' => $e->getLine()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $jobOrder = JobOrder::find($id);

        if (!$jobOrder) {
            return response()->json(['error' => 'Job Order not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'nullable|in:pending,ongoing,completed',
            'completed_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'priority' => 'nullable|in:low,medium,high',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $updateData = [];

            if ($request->has('status')) {
                $updateData['status'] = $request->status;
            }

            if ($request->has('completed_date')) {
                $updateData['completed_date'] = $request->completed_date;
            }

            if ($request->has('notes')) {
                $updateData['notes'] = $request->notes;
            }

            if ($request->has('priority')) {
                $updateData['priority'] = $request->priority;
            }

            if (!empty($updateData)) {
                $jobOrder->update($updateData);
            }

            $jobOrder->load(['assignedTo', 'customer', 'items.product', 'items.service']);

            return response()->json([
                'success' => true,
                'message' => 'Job Order updated successfully',
                'data' => $jobOrder,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error updating job order', [
                'job_order_id' => $id,
                'message' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'Failed to update job order', 'message' => $e->getMessage()], 500);
        }
    }

    public function updateItem(Request $request, $id)
    {
        $item = JobOrderItem::find($id);

        if (!$item) {
            return response()->json(['error' => 'Job Order Item not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'completed' => 'nullable|boolean',
            'completed_at' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $updateData = [];

            if ($request->has('completed')) {
                $updateData['completed'] = $request->completed;
                if ($request->completed && !$request->has('completed_at')) {
                    $updateData['completed_at'] = now();
                }
            }

            if ($request->has('completed_at')) {
                $updateData['completed_at'] = $request->completed_at;
            }

            if (!empty($updateData)) {
                $item->update($updateData);
            }

            $item->load(['product', 'service']);

            return response()->json([
                'success' => true,
                'message' => 'Item updated successfully',
                'data' => $item,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error updating job order item', [
                'item_id' => $id,
                'message' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'Failed to update item', 'message' => $e->getMessage()], 500);
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
