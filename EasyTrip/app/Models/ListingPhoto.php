<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ListingPhoto extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'listing_id',
        'photo_url',
    ];

    /**
     * Get the listing that owns the photo.
     */
    public function listing()
    {
        return $this->belongsTo(Listing::class);
    }
} 