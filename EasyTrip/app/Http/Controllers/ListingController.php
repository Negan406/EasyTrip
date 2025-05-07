<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use App\Models\ListingPhoto;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ListingController extends Controller
{
    /**
     * Display a listing of the listings.
     */
    public function index()
    {
        try {
            $listings = Listing::with(['host', 'photos'])
                ->where('status', 'approved')
                ->orderBy('created_at', 'desc')
                ->get();  // Changed from paginate to get all listings

            return response()->json([
                'success' => true,
                'data' => $listings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch listings: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Store a newly created listing.
     */
    public function store(Request $request)
    {
        // Validate the request
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'required|string',
            'price' => 'required|numeric|min:0',
            'category' => 'required|string|in:beach-houses,city-apartments,mountain-cabins,luxury-villas,pools',
            'main_photo' => 'required|image|mimes:jpeg,png,jpg|max:5120', // 5MB max
            'photos.*' => 'nullable|image|mimes:jpeg,png,jpg|max:5120', // Additional photos
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            // Store main photo
            $mainPhotoPath = $request->file('main_photo')->store('listings', 'public');

            // Create the listing
            $listing = Listing::create([
                'host_id' => Auth::id(),
                'title' => $request->title,
                'description' => $request->description,
                'location' => $request->location,
                'price' => $request->price,
                'category' => $request->category,
                'main_photo' => $mainPhotoPath,
                'status' => 'pending'
            ]);

            // Store additional photos if any
            if ($request->hasFile('photos')) {
                foreach ($request->file('photos') as $photo) {
                    $photoPath = $photo->store('listings', 'public');
                    ListingPhoto::create([
                        'listing_id' => $listing->id,
                        'photo_url' => $photoPath
                    ]);
                }
            }

            // Fetch all listings after creating new one
            $allListings = Listing::with(['host', 'photos'])
                ->where('status', 'approved')
                ->orderBy('created_at', 'desc')
                ->paginate(12);

            return response()->json([
                'success' => true,
                'message' => 'Listing created successfully and pending approval',
                'listing' => $listing->load('photos'),
                'data' => $allListings->items(),
                'current_page' => $allListings->currentPage(),
                'last_page' => $allListings->lastPage(),
                'total' => $allListings->total()
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            // Delete uploaded files if listing creation fails
            if (isset($mainPhotoPath)) {
                Storage::disk('public')->delete($mainPhotoPath);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create listing: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified listing.
     */
    public function show(Listing $listing)
    {
        return response()->json([
            'success' => true,
            'listing' => $listing->load(['host', 'photos', 'reviews.user'])
        ]);
    }

    /**
     * Update the specified listing.
     */
    public function update(Request $request, Listing $listing)
    {
        // Check if user is the host
        if ($listing->host_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], Response::HTTP_FORBIDDEN);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'location' => 'sometimes|string',
            'price' => 'sometimes|numeric|min:0',
            'category' => 'sometimes|string|in:beach-houses,city-apartments,mountain-cabins,luxury-villas,pools',
            'main_photo' => 'sometimes|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $data = $request->only(['title', 'description', 'location', 'price', 'category']);

            if ($request->hasFile('main_photo')) {
                // Delete old main photo
                Storage::disk('public')->delete($listing->main_photo);
                
                // Store new main photo
                $data['main_photo'] = $request->file('main_photo')->store('listings', 'public');
            }

            $listing->update($data);

            return response()->json([
                'success' => true,
                'listing' => $listing->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update listing: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Remove the specified listing.
     */
    public function destroy(Listing $listing)
    {
        // Check if user is either the host or an admin
        if (Auth::user()->role !== 'admin' && $listing->host_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], Response::HTTP_FORBIDDEN);
        }

        try {
            // Begin transaction
            DB::beginTransaction();

            // Delete all additional photos first
            foreach ($listing->photos as $photo) {
                try {
                    // Delete the physical file
                    if ($photo->photo_url && Storage::disk('public')->exists($photo->photo_url)) {
                        Storage::disk('public')->delete($photo->photo_url);
                    }
                    // Delete the database record
                    $photo->delete();
                } catch (\Exception $e) {
                    Log::error('Error deleting photo: ' . $e->getMessage());
                }
            }

            // Delete main photo
            if ($listing->main_photo && Storage::disk('public')->exists($listing->main_photo)) {
                try {
                    Storage::disk('public')->delete($listing->main_photo);
                } catch (\Exception $e) {
                    Log::error('Error deleting main photo: ' . $e->getMessage());
                }
            }

            // Finally delete the listing
            $listing->delete();

            // Commit transaction
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Listing and all associated photos deleted successfully'
            ]);
        } catch (\Exception $e) {
            // Rollback transaction if any error occurs
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete listing: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
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

    /**
     * Get all pending listings (admin only).
     */
    public function getPendingListings()
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], Response::HTTP_FORBIDDEN);
        }

        try {
            $pendingListings = Listing::with(['host', 'photos'])
                ->where('status', 'pending')
                ->latest()
                ->get();

            return response()->json([
                'success' => true,
                'listings' => $pendingListings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch pending listings: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Approve a listing (admin only).
     */
    public function approveListing(Listing $listing)
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], Response::HTTP_FORBIDDEN);
        }

        try {
            $listing->update(['status' => 'approved']);

            return response()->json([
                'success' => true,
                'message' => 'Listing approved successfully',
                'listing' => $listing->fresh()->load(['host', 'photos'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve listing: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Reject a listing (admin only).
     */
    public function rejectListing(Listing $listing)
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], Response::HTTP_FORBIDDEN);
        }

        try {
            $listing->update(['status' => 'rejected']);

            return response()->json([
                'success' => true,
                'message' => 'Listing rejected successfully',
                'listing' => $listing->fresh()->load(['host', 'photos'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject listing: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get listings for the authenticated user.
     */
    public function getUserListings()
    {
        try {
            $listings = Listing::with(['photos'])
                ->where('host_id', Auth::id())
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'listings' => $listings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch your listings: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
} 