<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ListingController;
use App\Http\Controllers\AuthController;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

// Authentication routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::resource('listings', ListingController::class);
Route::middleware(['auth:sanctum'])->group(function () {
    Route::resource('wishlists', WishlistController::class);
    Route::resource('reviews', ReviewController::class);
    Route::resource('bookings', BookingController::class);
    
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});

require __DIR__.'/auth.php';
