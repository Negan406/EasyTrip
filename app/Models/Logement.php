<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Logement extends Model
{
    use HasFactory;

    protected $fillable = [
        'titre',
        'description',
        'adresse',
        'prixParNuit',
        'disponibilites',
        'user_id'
    ];

    protected $casts = [
        'disponibilites' => 'array',
        'prixParNuit' => 'float'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function avis()
    {
        return $this->hasMany(Avis::class);
    }

    public function isDisponible($dateDebut, $dateFin)
    {
        // Logic to check availability based on disponibilites array
        // and existing reservations
        return true;
    }
}