<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Listing extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'host_id',
        'title',
        'description',
        'location',
        'price',
        'category',
        'main_photo',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'decimal:2',
        'status' => 'string'
    ];

    /**
     * Get the host of the listing.
     */
    public function host()
    {
        return $this->belongsTo(User::class, 'host_id');
    }

    /**
     * Get the photos for the listing.
     */
    public function photos()
    {
        return $this->hasMany(ListingPhoto::class);
    }

    /**
     * Get the bookings for the listing.
     */
    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Get the reviews for the listing.
     */
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Get the users who have wishlisted this listing.
     */
    public function wishlistedBy()
    {
        return $this->belongsToMany(User::class, 'wishlists')
            ->withTimestamps();
    }
} 