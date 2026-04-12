<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\User;

class Rating extends Model
{
    use SoftDeletes;

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

    /**
     * Alias for customer relationship
     */
    public function user(): BelongsTo
    {
        return $this->customer();
    }
}
