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
        $request->validate([
            'listing_id' => 'required|exists:listings,id'
        ]);

        $reviews = Review::with('user')
            ->where('listing_id', $request->listing_id)
            ->latest()
            ->paginate(10);

        return response()->json($reviews);
    }

    /**
     * Store a newly created review.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'listing_id' => 'required|exists:listings,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|max:1000',
        ]);

        // Check if user has booked and completed their stay
        $hasValidBooking = Booking::where('user_id', Auth::id())
            ->where('listing_id', $validated['listing_id'])
            ->where('end_date', '<', now())
            ->exists();

        if (!$hasValidBooking) {
            return response()->json(
                ['message' => 'You can only review after completing your stay'],
                Response::HTTP_FORBIDDEN
            );
        }

        // Check if user has already reviewed
        $hasReviewed = Review::where('user_id', Auth::id())
            ->where('listing_id', $validated['listing_id'])
            ->exists();

        if ($hasReviewed) {
            return response()->json(
                ['message' => 'You have already reviewed this listing'],
                Response::HTTP_FORBIDDEN
            );
        }

        $review = Review::create([
            'user_id' => Auth::id(),
            ...$validated
        ]);

        return response()->json($review->load('user'), Response::HTTP_CREATED);
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