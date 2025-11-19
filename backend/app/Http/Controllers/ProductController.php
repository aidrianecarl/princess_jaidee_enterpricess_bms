<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Color;
use App\Models\Size;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    // Get all products
    public function index(Request $request)
    {
        $query = Product::with(['category', 'color', 'size', 'creator']);

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('color_id')) {
            $query->where('color_id', $request->color_id);
        }

        if ($request->has('size_id')) {
            $query->where('size_id', $request->size_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $products = $query->paginate($request->per_page ?? 15);
        
        return response()->json([
            'success' => true,
            'data' => $products->items(),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'last_page' => $products->lastPage(),
            ]
        ], 200);
    }

    // Get single product
    public function show($id)
    {
        $product = Product::with(['category', 'color', 'size', 'creator'])->find($id);

        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        return response()->json($product, 200);
    }

    // Create product
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|unique:products,name',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'color_id' => 'nullable|exists:colors,id',
            'size_id' => 'nullable|exists:sizes,id',
            'base_price' => 'required|numeric|min:0',
            'unit_cost' => 'nullable|numeric|min:0',
            'quantity_in_stock' => 'required|integer|min:0',
            'reorder_level' => 'nullable|integer|min:0',
            'image_url' => 'nullable|string',
            'status' => 'in:active,inactive,discontinued',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $product = Product::create([
                'name' => $request->name,
                'description' => $request->description,
                'category_id' => $request->category_id,
                'color_id' => $request->color_id,
                'size_id' => $request->size_id,
                'base_price' => $request->base_price,
                'unit_cost' => $request->unit_cost,
                'quantity_in_stock' => $request->quantity_in_stock,
                'reorder_level' => $request->reorder_level ?? 10,
                'image_url' => $request->image_url,
                'status' => $request->status ?? 'active',
                'created_by' => Auth::id(),
            ]);

            return response()->json([
                'message' => 'Product created successfully',
                'product' => $product->load(['category', 'color', 'size', 'creator']),
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Update product
    public function update(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'string|unique:products,name,' . $id,
            'description' => 'nullable|string',
            'category_id' => 'exists:categories,id',
            'color_id' => 'nullable|exists:colors,id',
            'size_id' => 'nullable|exists:sizes,id',
            'base_price' => 'numeric|min:0',
            'unit_cost' => 'nullable|numeric|min:0',
            'quantity_in_stock' => 'integer|min:0',
            'reorder_level' => 'nullable|integer|min:0',
            'image_url' => 'nullable|string',
            'status' => 'in:active,inactive,discontinued',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $product->update($request->only([
                'name', 'description', 'category_id', 'color_id', 'size_id',
                'base_price', 'unit_cost', 'quantity_in_stock', 'reorder_level',
                'image_url', 'status'
            ]));

            return response()->json([
                'message' => 'Product updated successfully',
                'product' => $product->load(['category', 'color', 'size', 'creator']),
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Delete product
    public function destroy($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully',
        ], 200);
    }

    public function addStock(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $product->quantity_in_stock += $request->quantity;
            $product->save();

            return response()->json([
                'message' => 'Stock added successfully',
                'product' => $product->load(['category', 'color', 'size', 'creator']),
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getColors()
    {
        $colors = Color::all();
        return response()->json($colors, 200);
    }

    public function storeColor(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|unique:colors,name',
            'hex_code' => 'nullable|string|regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $color = Color::create([
                'name' => $request->name,
                'hex_code' => $request->hex_code,
            ]);

            return response()->json([
                'message' => 'Color created successfully',
                'color' => $color,
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function updateColor(Request $request, $id)
    {
        $color = Color::find($id);

        if (!$color) {
            return response()->json(['error' => 'Color not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'string|unique:colors,name,' . $id,
            'hex_code' => 'nullable|string|regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $color->update($request->only(['name', 'hex_code']));

            return response()->json([
                'message' => 'Color updated successfully',
                'color' => $color,
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroyColor($id)
    {
        $color = Color::find($id);

        if (!$color) {
            return response()->json(['error' => 'Color not found'], 404);
        }

        // Check if color is being used by products
        if ($color->products()->exists()) {
            return response()->json(['error' => 'Cannot delete color that is assigned to products'], 422);
        }

        $color->delete();

        return response()->json([
            'message' => 'Color deleted successfully',
        ], 200);
    }

    public function getSizes()
    {
        $sizes = Size::all();
        return response()->json($sizes, 200);
    }

    public function storeSize(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|unique:sizes,name',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $size = Size::create([
                'name' => $request->name,
                'description' => $request->description,
            ]);

            return response()->json([
                'message' => 'Size created successfully',
                'size' => $size,
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function updateSize(Request $request, $id)
    {
        $size = Size::find($id);

        if (!$size) {
            return response()->json(['error' => 'Size not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'string|unique:sizes,name,' . $id,
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $size->update($request->only(['name', 'description']));

            return response()->json([
                'message' => 'Size updated successfully',
                'size' => $size,
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroySize($id)
    {
        $size = Size::find($id);

        if (!$size) {
            return response()->json(['error' => 'Size not found'], 404);
        }

        // Check if size is being used by products
        if ($size->products()->exists()) {
            return response()->json(['error' => 'Cannot delete size that is assigned to products'], 422);
        }

        $size->delete();

        return response()->json([
            'message' => 'Size deleted successfully',
        ], 200);
    }

    // Get all categories
    public function getCategories()
    {
        $categories = Category::all();
        return response()->json([
            'success' => true,
            'data' => $categories
        ], 200);
    }
}
