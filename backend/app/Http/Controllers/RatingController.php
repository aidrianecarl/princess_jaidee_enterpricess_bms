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
            \Log::info('[v0] ='.str_repeat('=', 50).' START RATINGS FETCH '.str_repeat('=', 50).'=');
            \Log::info('[v0] Starting ratings fetch endpoint');
            
            $limit = (int)$request->get('limit', 3);
            \Log::info('[v0] Request limit: ' . $limit);

            // Validate limit
            $limit = max(1, min($limit, 100));
            \Log::info('[v0] Validated limit: ' . $limit);

            // Query ratings
            \Log::info('[v0] Querying ratings table...');
            $query = Rating::with('customer')->orderBy('created_at', 'desc')->limit($limit);
            \Log::info('[v0] Query: ' . $query->toSql());
            
            $ratings = $query->get();
            \Log::info('[v0] Found ' . count($ratings) . ' ratings');

            // If no ratings, return empty array
            if ($ratings->isEmpty()) {
                \Log::info('[v0] No ratings found, returning empty array');
                \Log::info('[v0] '.str_repeat('=', 110).' END RATINGS FETCH - NO DATA '.str_repeat('=', 110).'=');
                return response()->json([]);
            }

            // Format ratings
            \Log::info('[v0] Formatting ' . count($ratings) . ' ratings...');
            
            $formatted = [];
            foreach ($ratings as $rating) {
                \Log::info('[v0] Processing rating ID: ' . $rating->id);
                
                $firstName = 'Customer';
                $lastName = '';
                
                if ($rating->customer) {
                    $firstName = $rating->customer->first_name ?? 'Customer';
                    $lastName = $rating->customer->last_name ?? '';
                    \Log::info('[v0] Customer found: ' . $firstName . ' ' . $lastName);
                } else {
                    \Log::info('[v0] No customer data for rating ID: ' . $rating->id);
                }

                $emoji = match($rating->feedback_type) {
                    'bad' => '😞',
                    'average' => '😐',
                    'happy' => '😊',
                    default => '😊',
                };

                $item = [
                    'id' => $rating->id,
                    'customer_id' => $rating->customer_id,
                    'feedback_type' => $rating->feedback_type,
                    'emoji' => $emoji,
                    'created_at' => $rating->created_at ? $rating->created_at->toDateTimeString() : now()->toDateTimeString(),
                    'user' => [
                        'first_name' => $firstName,
                        'last_name' => $lastName,
                    ]
                ];
                
                $formatted[] = $item;
                \Log::info('[v0] Formatted rating: ' . json_encode($item));
            }

            \Log::info('[v0] Successfully formatted all ratings');
            \Log::info('[v0] '.str_repeat('=', 110).' END RATINGS FETCH - SUCCESS '.str_repeat('=', 110).'=');
            
            return response()->json($formatted);
            
        } catch (\Exception $e) {
            \Log::error('[v0] EXCEPTION in ratings index:');
            \Log::error('[v0] Message: ' . $e->getMessage());
            \Log::error('[v0] Code: ' . $e->getCode());
            \Log::error('[v0] File: ' . $e->getFile());
            \Log::error('[v0] Line: ' . $e->getLine());
            \Log::error('[v0] Trace: ' . $e->getTraceAsString());
            \Log::info('[v0] '.str_repeat('=', 110).' END RATINGS FETCH - ERROR '.str_repeat('=', 110).'=');
            
            return response()->json([
                'error' => 'Unable to load ratings',
                'message' => $e->getMessage()
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
            'feedback_type' => 'required|in:bad,average,happy',
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
                    'feedback_type' => $request->feedback_type,
                    'has_rating' => true,
                ]);

                Log::info('[v0] Rating updated successfully', [
                    'customer_id' => $customerId,
                    'rating_id' => $existingRating->id,
                    'feedback_type' => $request->feedback_type,
                ]);

                return response()->json([
                    'message' => 'Rating updated successfully',
                    'rating' => $existingRating,
                ], 200);
            }

            Log::info('[v0] Creating new rating for customer: ' . $customerId);
            Log::info('[v0] Feedback type: ' . $request->feedback_type);

            // Create new rating
            $rating = Rating::create([
                'customer_id' => $customerId,
                'feedback_type' => $request->feedback_type,
                'has_rating' => true,
            ]);

            Log::info('[v0] Rating created successfully', [
                'customer_id' => $customerId,
                'rating_id' => $rating->id,
                'feedback_type' => $rating->feedback_type,
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
