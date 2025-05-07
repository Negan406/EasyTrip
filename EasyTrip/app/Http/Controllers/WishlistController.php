<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use App\Models\Wishlist;
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
        $user = Auth::user();
        $wishlists = Wishlist::where('user_id', $user->id)
            ->with(['listing' => function($query) {
                $query->select('id', 'title', 'description', 'location', 'price', 'main_photo', 'category');
            }])
            ->get();

        $listings = $wishlists->map(function ($wishlist) {
            return [
                'id' => $wishlist->listing->id,
                'title' => $wishlist->listing->title,
                'description' => $wishlist->listing->description,
                'location' => $wishlist->listing->location,
                'price' => $wishlist->listing->price,
                'main_photo' => $wishlist->listing->main_photo,
                'category' => $wishlist->listing->category,
                'wishlist_id' => $wishlist->id
            ];
        });

        return response()->json($listings);
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
        $existingWishlist = Wishlist::where('user_id', $user->id)
            ->where('listing_id', $request->listing_id)
            ->first();

        if ($existingWishlist) {
            return response()->json([
                'message' => 'Listing already in wishlist',
                'wishlist_id' => $existingWishlist->id
            ], Response::HTTP_BAD_REQUEST);
        }

        // Create new wishlist entry
        $wishlist = new Wishlist();
        $wishlist->user_id = $user->id;
        $wishlist->listing_id = $request->listing_id;
        $wishlist->save();

        return response()->json([
            'message' => 'Added to wishlist',
            'wishlist_id' => $wishlist->id
        ], Response::HTTP_CREATED);
    }

    /**
     * Remove a listing from wishlist.
     */
    public function destroy($wishlistId)
    {
        $user = Auth::user();
        
        $deleted = Wishlist::where('user_id', $user->id)
            ->where('id', $wishlistId)
            ->delete();

        if ($deleted) {
            return response()->json(['message' => 'Removed from wishlist'], Response::HTTP_OK);
        }

        return response()->json(['message' => 'Wishlist item not found'], Response::HTTP_NOT_FOUND);
    }

    /**
     * Check if a listing is in user's wishlist.
     */
    public function check($listingId)
    {
        $user = Auth::user();
        
        $wishlist = Wishlist::where('user_id', $user->id)
            ->where('listing_id', $listingId)
            ->first();

        return response()->json([
            'is_wishlisted' => $wishlist !== null,
            'wishlist_id' => $wishlist ? $wishlist->id : null
        ]);
    }
} 