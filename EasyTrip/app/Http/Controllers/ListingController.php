<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class ListingController extends Controller
{
    /**
     * Display a listing of the listings.
     */
    public function index()
    {
        $listings = Listing::with(['host', 'photos'])
            ->where('status', 'approved')
            ->latest()
            ->paginate(12);
            
        return response()->json($listings);
    }

    /**
     * Store a newly created listing.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'required|string',
            'price' => 'required|numeric|min:0',
            'category' => 'required|string',
            'main_photo' => 'required|string',
        ]);

        $listing = Listing::create([
            'host_id' => Auth::id(),
            ...$validated,
            'status' => 'pending'
        ]);

        return response()->json($listing, Response::HTTP_CREATED);
    }

    /**
     * Display the specified listing.
     */
    public function show(Listing $listing)
    {
        return response()->json(
            $listing->load(['host', 'photos', 'reviews.user'])
        );
    }

    /**
     * Update the specified listing.
     */
    public function update(Request $request, Listing $listing)
    {
        // Check if user is the host
        if ($listing->host_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'location' => 'sometimes|string',
            'price' => 'sometimes|numeric|min:0',
            'category' => 'sometimes|string',
            'main_photo' => 'sometimes|string',
        ]);

        $listing->update($validated);

        return response()->json($listing);
    }

    /**
     * Remove the specified listing.
     */
    public function destroy(Listing $listing)
    {
        // Check if user is the host
        if ($listing->host_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        $listing->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    /**
     * Search listings by various criteria.
     */
    public function search(Request $request)
    {
        $query = Listing::query()->where('status', 'approved');

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('location')) {
            $query->where('location', 'like', '%' . $request->location . '%');
        }

        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        $listings = $query->with(['host', 'photos'])->latest()->paginate(12);

        return response()->json($listings);
    }
} 