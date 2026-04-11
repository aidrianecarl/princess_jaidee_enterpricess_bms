<?php

namespace App\Http\Controllers;

use App\Models\Rating;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class RatingController extends Controller
{
    /**
     * Get ratings with optional limit and ordering
     * GET /api/ratings?limit=3&orderBy=recent
     */
    public function index(Request $request)
    {
        try {
            $limit = $request->get('limit', 3);
            $orderBy = $request->get('orderBy', 'recent');

            $query = Rating::query()
                ->with('customer')
                ->where('has_rating', true);

            // Order by created_at descending (most recent first)
            if ($orderBy === 'recent') {
                $query->orderBy('created_at', 'desc');
            } else {
                $query->orderBy('created_at', 'desc');
            }

            $ratings = $query->limit($limit)->get();

            // Format response data
            $formattedRatings = $ratings->map(function ($rating) {
                return [
                    'id' => $rating->id,
                    'customer_id' => $rating->customer_id,
                    'star_rating' => $rating->star_rating,
                    'message' => $rating->message,
                    'has_rating' => $rating->has_rating,
                    'created_at' => $rating->created_at,
                    'user' => $rating->customer ? [
                        'id' => $rating->customer->id,
                        'first_name' => $rating->customer->first_name,
                        'last_name' => $rating->customer->last_name,
                        'email' => $rating->customer->email,
                    ] : null,
                ];
            });

            return response()->json($formattedRatings, 200);
        } catch (\Exception $e) {
            Log::error('Error fetching ratings', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'error' => 'Failed to fetch ratings',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a new rating
     * POST /api/ratings
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'star_rating' => 'required|integer|min:1|max:5',
            'message' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $customerId = auth()->id();

            if (!$customerId) {
                return response()->json([
                    'error' => 'Unauthorized',
                    'message' => 'You must be logged in to submit a rating',
                ], 401);
            }

            // Check if customer already has a rating
            $existingRating = Rating::where('customer_id', $customerId)->first();

            if ($existingRating) {
                // Update existing rating
                $existingRating->update([
                    'star_rating' => $request->star_rating,
                    'message' => $request->message,
                    'has_rating' => true,
                ]);

                Log::info('Rating updated successfully', [
                    'customer_id' => $customerId,
                    'rating_id' => $existingRating->id,
                ]);

                return response()->json([
                    'message' => 'Rating updated successfully',
                    'rating' => $existingRating,
                ], 200);
            }

            // Create new rating
            $rating = Rating::create([
                'customer_id' => $customerId,
                'star_rating' => $request->star_rating,
                'message' => $request->message,
                'has_rating' => true,
            ]);

            Log::info('Rating created successfully', [
                'customer_id' => $customerId,
                'rating_id' => $rating->id,
            ]);

            return response()->json([
                'message' => 'Rating submitted successfully',
                'rating' => $rating,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating rating', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'customer_id' => auth()->id(),
            ]);
            return response()->json([
                'error' => 'Failed to submit rating',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a single rating
     * GET /api/ratings/{id}
     */
    public function show($id)
    {
        try {
            $rating = Rating::with('customer')->find($id);

            if (!$rating) {
                return response()->json(['error' => 'Rating not found'], 404);
            }

            return response()->json($rating, 200);
        } catch (\Exception $e) {
            Log::error('Error fetching rating', [
                'message' => $e->getMessage(),
                'rating_id' => $id,
            ]);
            return response()->json([
                'error' => 'Failed to fetch rating',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check if current user has already rated
     * GET /api/ratings/check/user
     */
    public function checkUserRating()
    {
        try {
            $customerId = auth()->id();

            if (!$customerId) {
                return response()->json(['has_rated' => false], 200);
            }

            $rating = Rating::where('customer_id', $customerId)
                ->where('has_rating', true)
                ->first();

            return response()->json([
                'has_rated' => $rating !== null,
                'rating' => $rating,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error checking user rating', [
                'message' => $e->getMessage(),
            ]);
            return response()->json([
                'error' => 'Failed to check rating status',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
