<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Listing;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class BookingController extends Controller
{
    /**
     * Display a listing of the user's bookings.
     */
    public function index()
    {
        try {
            $bookings = Booking::with(['listing', 'listing.host'])
                ->where('user_id', Auth::id())
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($booking) {
                    return [
                        'id' => $booking->id,
                        'listing' => $booking->listing,
                        'start_date' => $booking->start_date,
                        'end_date' => $booking->end_date,
                        'total_price' => $booking->total_price,
                        'payment_status' => $booking->payment_status,
                        'host' => $booking->listing->host,
                        'created_at' => $booking->created_at
                    ];
                });

            return response()->json([
                'message' => 'Bookings retrieved successfully',
                'data' => $bookings
            ]);
        } catch (\Exception $e) {
            Log::error('Error retrieving bookings: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to retrieve bookings',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Store a newly created booking.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'listing_id' => 'required|exists:listings,id',
                'start_date' => 'required|date|after:today',
                'end_date' => 'required|date|after:start_date',
            ]);

            $listing = Listing::findOrFail($validated['listing_id']);
            
            // Check if the dates are available before creating booking
            $startDate = $validated['start_date'];
            $endDate = $validated['end_date'];
            
            // Check for any existing bookings that overlap with the requested dates
            $existingBookings = Booking::where('listing_id', $validated['listing_id'])
                ->where('payment_status', 'completed')
                ->where(function($query) use ($startDate, $endDate) {
                    // Checks for any overlap between the requested dates and existing bookings
                    // Case 1: Existing booking starts during the requested period
                    $query->whereBetween('start_date', [$startDate, $endDate])
                    // Case 2: Existing booking ends during the requested period
                    ->orWhereBetween('end_date', [$startDate, $endDate])
                    // Case 3: Existing booking completely covers the requested period
                    ->orWhere(function($q) use ($startDate, $endDate) {
                        $q->where('start_date', '<=', $startDate)
                          ->where('end_date', '>=', $endDate);
                    });
                })
                ->exists();
                
            if ($existingBookings) {
                return response()->json([
                    'success' => false,
                    'message' => 'The selected dates are not available for this listing.'
                ], Response::HTTP_CONFLICT); // 409 Conflict status code
            }
            
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

            return response()->json([
                'success' => true,
                'message' => 'Booking created successfully',
                'booking' => $booking->load('listing')
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            Log::error('Booking creation failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create booking',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
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

    /**
     * Accept a booking.
     */
    public function acceptBooking(Booking $booking)
    {
        try {
            // Check if user is the host of the listing
            if ($booking->listing->host_id !== Auth::id()) {
                return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
            }

            // Check if booking is in pending payment status
            if ($booking->payment_status !== 'pending') {
                return response()->json([
                    'message' => 'Can only accept bookings with pending payment status'
                ], Response::HTTP_BAD_REQUEST);
            }

            $booking->payment_status = 'completed';
            $booking->save();

            return response()->json([
                'message' => 'Booking accepted successfully',
                'booking' => $booking->load(['listing', 'user'])
            ]);
        } catch (\Exception $e) {
            Log::error('Error accepting booking: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to accept booking',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Refuse a booking.
     */
    public function refuseBooking(Booking $booking)
    {
        try {
            // Check if user is the host of the listing
            if ($booking->listing->host_id !== Auth::id()) {
                return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
            }

            // Check if booking is in pending payment status
            if ($booking->payment_status !== 'pending') {
                return response()->json([
                    'message' => 'Can only refuse bookings with pending payment status'
                ], Response::HTTP_BAD_REQUEST);
            }

            $booking->payment_status = 'cancelled';
            $booking->save();

            return response()->json([
                'message' => 'Booking refused successfully',
                'booking' => $booking->load(['listing', 'user'])
            ]);
        } catch (\Exception $e) {
            Log::error('Error refusing booking: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to refuse booking',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Check if the authenticated user has a completed payment for a listing
     */
    public function checkBookingStatus($listingId)
    {
        try {
            $userId = Auth::id();
            
            $hasCompletedPayment = Booking::where('user_id', $userId)
                ->where('listing_id', $listingId)
                ->where('payment_status', 'completed')
                ->exists();

            return response()->json([
                'success' => true,
                'isBooked' => $hasCompletedPayment
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error checking booking status: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Check if a listing is available for the requested dates
     */
    public function checkDateAvailability(Request $request, $listingId)
    {
        try {
            $validator = Validator::make($request->all(), [
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => $validator->errors()->first(),
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $startDate = $request->start_date;
            $endDate = $request->end_date;

            // Check for any existing bookings that overlap with the requested dates
            $existingBookings = Booking::where('listing_id', $listingId)
                ->where('payment_status', 'completed')
                ->where(function($query) use ($startDate, $endDate) {
                    // Checks for any overlap between the requested dates and existing bookings
                    // Case 1: Existing booking starts during the requested period
                    $query->whereBetween('start_date', [$startDate, $endDate])
                    // Case 2: Existing booking ends during the requested period
                    ->orWhereBetween('end_date', [$startDate, $endDate])
                    // Case 3: Existing booking completely covers the requested period
                    ->orWhere(function($q) use ($startDate, $endDate) {
                        $q->where('start_date', '<=', $startDate)
                          ->where('end_date', '>=', $endDate);
                    });
                })
                ->get();

            $isAvailable = $existingBookings->isEmpty();
            $unavailableDates = [];

            if (!$isAvailable) {
                $unavailableDates = $existingBookings->map(function($booking) {
                    return [
                        'start_date' => $booking->start_date->format('Y-m-d'),
                        'end_date' => $booking->end_date->format('Y-m-d')
                    ];
                });
            }

            return response()->json([
                'success' => true,
                'is_available' => $isAvailable,
                'unavailable_dates' => $unavailableDates
            ]);
        } catch (\Exception $e) {
            Log::error('Error checking date availability: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error checking date availability: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Check if the authenticated user has a completed booking for a specific listing
     * This is used to determine if a user can leave a review
     */
    public function checkCompletedBooking($listingId)
    {
        try {
            $userId = Auth::id();
            
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required',
                    'hasCompletedPayment' => false
                ], Response::HTTP_UNAUTHORIZED);
            }
            
            $hasCompletedPayment = Booking::where('user_id', $userId)
                ->where('listing_id', $listingId)
                ->where('payment_status', 'completed')
                ->exists();

            return response()->json([
                'success' => true,
                'hasCompletedPayment' => $hasCompletedPayment
            ]);
        } catch (\Exception $e) {
            Log::error('Error checking completed booking: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error checking completed booking: ' . $e->getMessage(),
                'hasCompletedPayment' => false
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
} 