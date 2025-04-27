<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class WishlistController extends Controller
{
    /**
     * Display user's wishlist.
     */
    public function index()
    {
        $wishlist = Auth::user()
            ->wishlist()
            ->with('host', 'photos')
            ->paginate(12);

        return response()->json($wishlist);
    }

    /**
     * Add a listing to wishlist.
     */
    public function store(Request $request)
    {
        $request->validate([
            'listing_id' => 'required|exists:listings,id'
        ]);

        $user = Auth::user();
        
        // Check if already in wishlist
        if ($user->wishlist()->where('listing_id', $request->listing_id)->exists()) {
            return response()->json(
                ['message' => 'Listing already in wishlist'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $user->wishlist()->attach($request->listing_id);

        return response()->json(
            ['message' => 'Added to wishlist'],
            Response::HTTP_CREATED
        );
    }

    /**
     * Remove a listing from wishlist.
     */
    public function destroy($listingId)
    {
        $user = Auth::user();
        
        $user->wishlist()->detach($listingId);

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    /**
     * Check if a listing is in user's wishlist.
     */
    public function check($listingId)
    {
        $isWishlisted = Auth::user()
            ->wishlist()
            ->where('listing_id', $listingId)
            ->exists();

        return response()->json(['is_wishlisted' => $isWishlisted]);
    }
} 