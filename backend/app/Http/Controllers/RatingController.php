<?php

namespace App\Http\Controllers;

use App\Models\Rating;
use App\Models\User;
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
            Log::info('[v0] Starting ratings fetch endpoint');
            
            $limit = (int)$request->get('limit', 3);
            Log::info('[v0] Request limit parameter: ' . $limit);

            // Validate limit
            if ($limit < 1) {
                $limit = 3;
            }
            if ($limit > 100) {
                $limit = 100;
            }
            Log::info('[v0] Validated limit: ' . $limit);

            // Fetch ratings with customer data
            Log::info('[v0] Attempting to fetch ratings from database');
            
            $ratings = Rating::with('customer')
                ->where('has_rating', true)
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get();

            Log::info('[v0] Successfully fetched ' . count($ratings) . ' ratings from database');
            Log::info('[v0] Raw ratings data: ' . json_encode($ratings));

            // Format response data
            $formattedRatings = $ratings->map(function ($rating) {
                Log::info('[v0] Processing rating ID: ' . $rating->id);
                Log::info('[v0] Rating star_rating: ' . $rating->star_rating);
                Log::info('[v0] Rating message: ' . ($rating->message ?? 'null'));
                Log::info('[v0] Rating customer_id: ' . $rating->customer_id);
                Log::info('[v0] Rating has customer relation: ' . ($rating->customer ? 'YES' : 'NO'));
                
                $customerData = null;
                if ($rating->customer) {
                    Log::info('[v0] Customer found - ID: ' . $rating->customer->id);
                    Log::info('[v0] Customer first_name: ' . ($rating->customer->first_name ?? 'null'));
                    Log::info('[v0] Customer last_name: ' . ($rating->customer->last_name ?? 'null'));
                    
                    $customerData = [
                        'id' => $rating->customer->id,
                        'first_name' => $rating->customer->first_name ?? 'Customer',
                        'last_name' => $rating->customer->last_name ?? '',
                    ];
                } else {
                    Log::info('[v0] WARNING - Customer relation is null for rating ID: ' . $rating->id);
                }

                return [
                    'id' => $rating->id,
                    'customer_id' => $rating->customer_id,
                    'star_rating' => (int)$rating->star_rating,
                    'message' => $rating->message,
                    'created_at' => $rating->created_at ? $rating->created_at->format('Y-m-d H:i:s') : null,
                    'user' => $customerData,
                ];
            });

            Log::info('[v0] Formatted ratings collection: ' . json_encode($formattedRatings));
            Log::info('[v0] Successfully returning ratings response');

            return response()->json($formattedRatings);
        } catch (\Exception $e) {
            Log::error('[v0] EXCEPTION CAUGHT in ratings index', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'error' => 'Failed to fetch ratings',
                'exception_message' => $e->getMessage(),
                'exception_code' => $e->getCode(),
            ], 500);
        }
    }

    /**
     * Store a new rating
     * POST /api/ratings
     */
    public function store(Request $request)
    {
        Log::info('[v0] Starting rating submission - store() method');
        Log::info('[v0] Request data: ' . json_encode($request->all()));

        $validator = Validator::make($request->all(), [
            'star_rating' => 'required|integer|min:1|max:5',
            'message' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            Log::warning('[v0] Validation failed: ' . json_encode($validator->errors()));
            return response()->json(['errors' => $validator->errors()], 422);
        }

        Log::info('[v0] Validation passed');

        try {
            $customerId = auth()->id();
            Log::info('[v0] Authenticated customer ID: ' . ($customerId ?? 'NULL'));

            if (!$customerId) {
                Log::warning('[v0] User not authenticated');
                return response()->json([
                    'error' => 'Unauthorized',
                    'message' => 'You must be logged in to submit a rating',
                ], 401);
            }

            Log::info('[v0] Checking for existing rating for customer: ' . $customerId);

            // Check if customer already has a rating
            $existingRating = Rating::where('customer_id', $customerId)->first();
            Log::info('[v0] Existing rating found: ' . ($existingRating ? 'YES (ID: ' . $existingRating->id . ')' : 'NO'));

            if ($existingRating) {
                Log::info('[v0] Updating existing rating for customer: ' . $customerId);
                
                // Update existing rating
                $existingRating->update([
                    'star_rating' => $request->star_rating,
                    'message' => $request->message,
                    'has_rating' => true,
                ]);

                Log::info('[v0] Rating updated successfully', [
                    'customer_id' => $customerId,
                    'rating_id' => $existingRating->id,
                    'star_rating' => $request->star_rating,
                ]);

                return response()->json([
                    'message' => 'Rating updated successfully',
                    'rating' => $existingRating,
                ], 200);
            }

            Log::info('[v0] Creating new rating for customer: ' . $customerId);
            Log::info('[v0] Star rating: ' . $request->star_rating);
            Log::info('[v0] Message: ' . ($request->message ?? 'NULL'));

            // Create new rating
            $rating = Rating::create([
                'customer_id' => $customerId,
                'star_rating' => $request->star_rating,
                'message' => $request->message,
                'has_rating' => true,
            ]);

            Log::info('[v0] Rating created successfully', [
                'customer_id' => $customerId,
                'rating_id' => $rating->id,
                'star_rating' => $rating->star_rating,
            ]);

            return response()->json([
                'message' => 'Rating submitted successfully',
                'rating' => $rating,
            ], 201);
        } catch (\Exception $e) {
            Log::error('[v0] EXCEPTION in rating submission', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'customer_id' => auth()->id(),
            ]);
            return response()->json([
                'error' => 'Failed to submit rating',
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
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
