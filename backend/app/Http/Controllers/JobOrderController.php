<?php

namespace App\Http\Controllers;

use App\Models\JobOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class JobOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = JobOrder::with(['order', 'assignedTo']);

        if ($request->has('search')) {
            $query->where('job_number', 'like', '%' . $request->search . '%');
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $jobOrders = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 15);

        return response()->json($jobOrders, 200);
    }

    public function show($id)
    {
        $jobOrder = JobOrder::with(['order', 'assignedTo'])->find($id);

        if (!$jobOrder) {
            return response()->json(['error' => 'Job Order not found'], 404);
        }

        return response()->json($jobOrder, 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id',
            'assigned_to_id' => 'required|exists:users,id',
            'description' => 'required|string',
            'start_date' => 'required|date',
            'due_date' => 'required|date|after:start_date',
            'priority' => 'required|in:low,medium,high,urgent',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $jobNumber = 'JO-' . date('Ymd') . '-' . str_pad(JobOrder::count() + 1, 5, '0', STR_PAD_LEFT);

            $jobOrder = JobOrder::create([
                'job_number' => $jobNumber,
                'order_id' => $request->order_id,
                'assigned_to_id' => $request->assigned_to_id,
                'description' => $request->description,
                'start_date' => $request->start_date,
                'due_date' => $request->due_date,
                'priority' => $request->priority,
                'status' => 'pending',
            ]);

            return response()->json([
                'message' => 'Job Order created successfully',
                'jobOrder' => $jobOrder,
            ], 201);
        } catch (\Exception $e) {
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
            'progress_percent' => 'nullable|integer|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $jobOrder->update($request->only(['status', 'progress_percent']));

        return response()->json([
            'message' => 'Job Order updated successfully',
            'jobOrder' => $jobOrder,
        ], 200);
    }

    public function destroy($id)
    {
        $jobOrder = JobOrder::find($id);

        if (!$jobOrder) {
            return response()->json(['error' => 'Job Order not found'], 404);
        }

        $jobOrder->delete();

        return response()->json([
            'message' => 'Job Order deleted successfully',
        ], 200);
    }
}
