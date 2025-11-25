<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ServiceController extends Controller
{
    // Get all services
    public function index(Request $request)
    {
        $query = Service::query();

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('all') || $request->is('admin/*')) {
            $services = $query->orderBy('created_at', 'desc')->get();
            return response()->json($services, 200);
        }

        $services = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 15);

        return response()->json($services, 200);
    }

    // Get single service
    public function show($id)
    {
        $service = Service::find($id);

        if (!$service) {
            return response()->json(['error' => 'Service not found'], 404);
        }

        return response()->json($service, 200);
    }

    // Create service
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:services,name',
            'slug' => 'nullable|string|max:255|unique:services,slug',
            'description' => 'nullable|string',
            'base_price' => 'required|numeric|min:0',
            'category' => 'nullable|string|max:255',
            'specifications' => 'nullable',
            'image_url' => 'nullable|string',
            'status' => 'nullable|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // Get authenticated user
            $user = $request->user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized. Please login again.'], 401);
            }

            $slug = $request->slug;
            if (empty($slug)) {
                $slug = Str::slug($request->name);
                // Ensure unique slug
                $originalSlug = $slug;
                $counter = 1;
                while (Service::where('slug', $slug)->exists()) {
                    $slug = $originalSlug . '-' . $counter;
                    $counter++;
                }
            }
            
            $specifications = $request->specifications;
            if (is_string($specifications) && !empty($specifications)) {
                $decoded = json_decode($specifications, true);
                $specifications = is_array($decoded) ? $decoded : [];
            } elseif (!is_array($specifications)) {
                $specifications = [];
            }

            $service = Service::create([
                'name' => $request->name,
                'slug' => $slug,
                'description' => $request->description,
                'base_price' => (float) $request->base_price,
                'category' => $request->category,
                'specifications' => $specifications,
                'image_url' => $request->image_url,
                'status' => $request->status ?? 'active',
                'created_by' => $user->id,
            ]);

            return response()->json([
                'message' => 'Service created successfully',
                'service' => $service,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to create service',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Update service
    public function update(Request $request, $id)
    {
        $service = Service::find($id);

        if (!$service) {
            return response()->json(['error' => 'Service not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255|unique:services,name,' . $id,
            'slug' => 'nullable|string|max:255|unique:services,slug,' . $id,
            'description' => 'nullable|string',
            'base_price' => 'sometimes|numeric|min:0',
            'category' => 'nullable|string|max:255',
            'specifications' => 'nullable',
            'image_url' => 'nullable|string',
            'status' => 'nullable|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $updateData = [];

            if ($request->has('name')) {
                $updateData['name'] = $request->name;
            }

            if ($request->has('description')) {
                $updateData['description'] = $request->description;
            }

            if ($request->has('base_price')) {
                $updateData['base_price'] = (float) $request->base_price;
            }

            if ($request->has('category')) {
                $updateData['category'] = $request->category;
            }

            if ($request->has('image_url')) {
                $updateData['image_url'] = $request->image_url;
            }

            if ($request->has('status')) {
                $updateData['status'] = $request->status;
            }

            // Handle slug
            if ($request->has('slug') && !empty($request->slug)) {
                $updateData['slug'] = $request->slug;
            } elseif ($request->has('name')) {
                $newSlug = Str::slug($request->name);
                if ($newSlug !== $service->slug) {
                    $originalSlug = $newSlug;
                    $counter = 1;
                    while (Service::where('slug', $newSlug)->where('id', '!=', $id)->exists()) {
                        $newSlug = $originalSlug . '-' . $counter;
                        $counter++;
                    }
                    $updateData['slug'] = $newSlug;
                }
            }

            if ($request->has('specifications')) {
                $specifications = $request->specifications;
                if (is_string($specifications) && !empty($specifications)) {
                    $decoded = json_decode($specifications, true);
                    $specifications = is_array($decoded) ? $decoded : [];
                } elseif (!is_array($specifications)) {
                    $specifications = [];
                }
                $updateData['specifications'] = $specifications;
            }

            $service->update($updateData);

            return response()->json([
                'message' => 'Service updated successfully',
                'service' => $service->fresh(),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update service',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Delete service
    public function destroy($id)
    {
        $service = Service::find($id);

        if (!$service) {
            return response()->json(['error' => 'Service not found'], 404);
        }

        try {
            $service->delete();

            return response()->json([
                'message' => 'Service deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete service',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function uploadImage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $file = $request->file('image');
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            
            // Store in public/services directory
            $path = Storage::disk('public')->putFileAs('services', $file, $filename);
            
            $imageUrl = asset('storage/' . $path);

            return response()->json([
                'message' => 'Image uploaded successfully',
                'image_url' => $imageUrl,
                'url' => $imageUrl,
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
