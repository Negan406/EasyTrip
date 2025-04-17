<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Avis extends Model
{
    use HasFactory;

    protected $fillable = [
        'note',
        'commentaire',
        'user_id',
        'logement_id'
    ];

    protected $casts = [
        'note' => 'integer'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function logement()
    {
        return $this->belongsTo(Logement::class);
    }

    public function scopeVerified($query)
    {
        return $query->whereHas('user', function($q) {
            $q->where('email_verified_at', '!=', null);
        });
    }
}