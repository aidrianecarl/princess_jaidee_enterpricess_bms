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
            $query = JobOrder::with(['assignedTo', 'customer', 'items.product', 'items.service']);

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
            $jobOrder = JobOrder::with(['assignedTo', 'customer', 'items.product', 'items.service'])->find($id);

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
            'order_id' => 'nullable|exists:orders,id',
            'customer_id' => 'required|exists:customers,id',
            'assigned_to' => 'required|exists:users,id',
            'start_date' => 'required|date',
            'due_date' => 'required|date|after:start_date',
            'priority' => 'nullable|in:low,medium,high',
            'payment_type' => 'nullable|in:downpayment,fullpayment',
            'paid_amount' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            Log::info('Creating job order with payload:', $request->all());

            $jobNumber = 'JO-' . date('Ymd') . '-' . str_pad(JobOrder::count() + 1, 5, '0', STR_PAD_LEFT);

            $jobOrder = JobOrder::create([
                'job_order_number' => $jobNumber,
                'quotation_id' => $request->quotation_id,
                'order_id' => $request->order_id,
                'customer_id' => $request->customer_id,
                'assigned_to' => $request->assigned_to,
                'start_date' => $request->start_date,
                'due_date' => $request->due_date,
                'priority' => $request->priority ?? 'medium',
                'status' => 'pending',
                'notes' => $request->notes ?? null,
            ]);

            // Update quotation with paid_amount if provided
            if ($request->quotation_id && $request->has('paid_amount')) {
                Quotation::where('id', $request->quotation_id)->update([
                    'paid_amount' => $request->paid_amount,
                ]);
                Log::info('Updated quotation paid_amount', [
                    'quotation_id' => $request->quotation_id,
                    'paid_amount' => $request->paid_amount,
                ]);
            }

            if ($request->quotation_id) {
                $quotation = Quotation::with('items')->find($request->quotation_id);
                if ($quotation && $quotation->items) {
                    foreach ($quotation->items as $item) {
                        JobOrderItem::create([
                            'job_order_id' => $jobOrder->id,
                            'product_id' => $item->product_id,
                            'service_id' => $item->service_id,
                            'description' => $item->description,
                            'quantity' => $item->quantity,
                            'unit_price' => $item->unit_price,
                        ]);
                    }
                }
            }

            Log::info('Job order created successfully', [
                'job_order_id' => $jobOrder->id,
                'job_order_number' => $jobOrder->job_order_number,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Job order created successfully',
                'data' => $jobOrder
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating job order', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            return response()->json(['error' => 'Failed to create job order', 'message' => $e->getMessage()], 500);
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
            'status' => 'required|in:pending,in_progress,in-progress,on_hold,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
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
            }

            $jobOrder->load(['assignedTo', 'customer', 'items.product', 'items.service']);
            $jobOrder->status = str_replace('-', '_', $jobOrder->status);

            return response()->json([
                'message' => 'Job Order updated successfully',
                'jobOrder' => $jobOrder,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error updating job order status: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
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
