<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class Rating extends Model
{
    protected $table = 'ratings';

    protected $fillable = [
        'customer_id',
        'star_rating',
        'message',
        'has_rating',
    ];

    protected $casts = [
        'star_rating' => 'integer',
        'has_rating' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user/customer that owns this rating
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id', 'id');
    }
}
