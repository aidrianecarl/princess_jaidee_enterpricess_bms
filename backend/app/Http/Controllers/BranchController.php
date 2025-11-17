<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BranchController extends Controller
{
    public function index(Request $request)
    {
        $query = Branch::query();

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('location', 'like', '%' . $request->search . '%');
        }

        $branches = $query->paginate($request->per_page ?? 15);

        return response()->json($branches, 200);
    }

    public function show($id)
    {
        $branch = Branch::find($id);

        if (!$branch) {
            return response()->json(['error' => 'Branch not found'], 404);
        }

        return response()->json($branch, 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|unique:branches,name',
            'location' => 'required|string',
            'address' => 'required|string',
            'zip_code' => 'required|string',
            'phone_number' => 'required|string',
            'email' => 'nullable|email',
            'manager_id' => 'nullable|exists:users,id',
            'is_centralized' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $branch = Branch::create([
                'name' => $request->name,
                'location' => $request->location,
                'address' => $request->address,
                'zip_code' => $request->zip_code,
                'phone_number' => $request->phone_number,
                'email' => $request->email,
                'manager_id' => $request->manager_id,
                'is_centralized' => $request->is_centralized ?? false,
            ]);

            return response()->json([
                'message' => 'Branch created successfully',
                'branch' => $branch,
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $branch = Branch::find($id);

        if (!$branch) {
            return response()->json(['error' => 'Branch not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'string|unique:branches,name,' . $id,
            'location' => 'string',
            'address' => 'string',
            'zip_code' => 'string',
            'phone_number' => 'string',
            'email' => 'nullable|email',
            'manager_id' => 'nullable|exists:users,id',
            'is_centralized' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $branch->update($request->all());

        return response()->json([
            'message' => 'Branch updated successfully',
            'branch' => $branch,
        ], 200);
    }

    public function destroy($id)
    {
        $branch = Branch::find($id);

        if (!$branch) {
            return response()->json(['error' => 'Branch not found'], 404);
        }

        $branch->delete();

        return response()->json([
            'message' => 'Branch deleted successfully',
        ], 200);
    }
}
