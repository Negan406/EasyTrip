<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'dateDebut',
        'dateFin',
        'statut',
        'user_id',
        'logement_id'
    ];

    protected $casts = [
        'dateDebut' => 'date',
        'dateFin' => 'date'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function logement()
    {
        return $this->belongsTo(Logement::class);
    }

    public function getDureeAttribute()
    {
        return $this->dateDebut->diffInDays($this->dateFin);
    }

    public function getMontantTotalAttribute()
    {
        return $this->duree * $this->logement->prixParNuit;
    }
}