<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    /**
     * Display a listing of reviews for a listing.
     */
    public function index(Request $request)
    {
        try {
            $request->validate([
                'listing_id' => 'required|exists:listings,id'
            ]);

            $query = Review::with('user')
                ->where('listing_id', $request->listing_id);
            
            // If user_id is provided, filter by it
            if ($request->has('user_id')) {
                $query->where('user_id', $request->user_id);
            }

            $reviews = $query->latest()->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $reviews->items(),
                'meta' => [
                    'total' => $reviews->total(),
                    'current_page' => $reviews->currentPage(),
                    'last_page' => $reviews->lastPage(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving reviews: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Store a newly created review.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'listing_id' => 'required|exists:listings,id',
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'required|string|max:1000',
            ]);

            // Check if user has already reviewed
            $hasReviewed = Review::where('user_id', Auth::id())
                ->where('listing_id', $validated['listing_id'])
                ->exists();

            if ($hasReviewed) {
                return response()->json([
                    'success' => false,
                    'message' => 'You have already reviewed this listing'
                ], Response::HTTP_FORBIDDEN);
            }

            $review = Review::create([
                'user_id' => Auth::id(),
                'listing_id' => $validated['listing_id'],
                'rating' => $validated['rating'],
                'comment' => $validated['comment']
            ]);

            // Load the user relationship for the response
            $review->load('user');

            return response()->json([
                'success' => true,
                'message' => 'Review submitted successfully',
                'data' => $review
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit review: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified review.
     */
    public function show(Review $review)
    {
        return response()->json($review->load('user'));
    }

    /**
     * Update the specified review.
     */
    public function update(Request $request, Review $review)
    {
        // Check if user owns the review
        if ($review->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validate([
            'rating' => 'sometimes|integer|min:1|max:5',
            'comment' => 'sometimes|string|max:1000',
        ]);

        $review->update($validated);

        return response()->json($review->load('user'));
    }

    /**
     * Remove the specified review.
     */
    public function destroy(Review $review)
    {
        // Check if user owns the review
        if ($review->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        $review->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    /**
     * Get user's reviews.
     */
    public function userReviews()
    {
        $reviews = Review::with(['listing'])
            ->where('user_id', Auth::id())
            ->latest()
            ->paginate(10);

        return response()->json($reviews);
    }
} 