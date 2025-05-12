<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ListingController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\WishlistController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);

// Protected routes
Route::middleware(['auth:sanctum'])->group(function () {
    // User route
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    // Admin routes
    Route::get('/users', [AuthController::class, 'getAllUsers']);
    Route::delete('/users/{id}', [AuthController::class, 'deleteUser']);
    
    // Admin routes for pending listings (must come before general listing routes)
    Route::get('/listings/pending', [ListingController::class, 'getPendingListings']);
    Route::post('/listings/{listing}/approve', [ListingController::class, 'approveListing']);
    Route::post('/listings/{listing}/reject', [ListingController::class, 'rejectListing']);
    
    // User listings route (must come before resource routes)
    Route::get('/listings/user', [ListingController::class, 'getUserListings']);
    
    // Custom booking routes (must come before resource routes)
    Route::get('/bookings/host', [BookingController::class, 'hostBookings']);
    Route::post('/bookings/{booking}/accept', [BookingController::class, 'acceptBooking']);
    Route::post('/bookings/{booking}/refuse', [BookingController::class, 'refuseBooking']);
    Route::get('/bookings/check/{listing}', [BookingController::class, 'checkBookingStatus']);
    
    // Resource routes
    Route::apiResource('listings', ListingController::class);
    Route::apiResource('bookings', BookingController::class);
    Route::apiResource('reviews', ReviewController::class);
    Route::apiResource('wishlists', WishlistController::class);
    
    // Additional routes
    Route::post('/logout', [AuthController::class, 'logout']);
});


