<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Listing;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class BookingController extends Controller
{
    /**
     * Display a listing of the user's bookings.
     */
    public function index()
    {
        $bookings = Booking::with(['listing', 'listing.host'])
            ->where('user_id', Auth::id())
            ->latest()
            ->paginate(10);

        return response()->json($bookings);
    }

    /**
     * Store a newly created booking.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'listing_id' => 'required|exists:listings,id',
            'start_date' => 'required|date|after:today',
            'end_date' => 'required|date|after:start_date',
        ]);

        $listing = Listing::findOrFail($validated['listing_id']);
        
        // Calculate total price based on days
        $start = new \DateTime($validated['start_date']);
        $end = new \DateTime($validated['end_date']);
        $days = $start->diff($end)->days;
        $total_price = $listing->price * $days;

        $booking = Booking::create([
            'user_id' => Auth::id(),
            'listing_id' => $validated['listing_id'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'total_price' => $total_price,
            'payment_status' => 'pending'
        ]);

        return response()->json($booking->load('listing'), Response::HTTP_CREATED);
    }

    /**
     * Display the specified booking.
     */
    public function show(Booking $booking)
    {
        // Check if user owns the booking
        if ($booking->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        return response()->json($booking->load(['listing', 'listing.host']));
    }

    /**
     * Update the specified booking.
     */
    public function update(Request $request, Booking $booking)
    {
        // Check if user owns the booking
        if ($booking->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validate([
            'start_date' => 'sometimes|date|after:today',
            'end_date' => 'sometimes|date|after:start_date',
        ]);

        if (!empty($validated)) {
            // Recalculate total price if dates changed
            if (isset($validated['start_date']) || isset($validated['end_date'])) {
                $start = new \DateTime($validated['start_date'] ?? $booking->start_date);
                $end = new \DateTime($validated['end_date'] ?? $booking->end_date);
                $days = $start->diff($end)->days;
                $validated['total_price'] = $booking->listing->price * $days;
            }

            $booking->update($validated);
        }

        return response()->json($booking->load('listing'));
    }

    /**
     * Cancel the specified booking.
     */
    public function destroy(Booking $booking)
    {
        // Check if user owns the booking
        if ($booking->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        $booking->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    /**
     * Get host's bookings.
     */
    public function hostBookings()
    {
        $bookings = Booking::whereHas('listing', function ($query) {
            $query->where('host_id', Auth::id());
        })
        ->with(['listing', 'user'])
        ->latest()
        ->paginate(10);

        return response()->json($bookings);
    }
} 