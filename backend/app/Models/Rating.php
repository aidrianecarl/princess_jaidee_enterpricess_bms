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
        'feedback_type',
        'has_rating',
    ];

    protected $casts = [
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
     * Get emoji representation of feedback type
     */
    public function getEmojiAttribute(): string
    {
        return match($this->feedback_type) {
            'bad' => '😞',
            'average' => '😐',
            'happy' => '😊',
            default => '😊',
        };
    }
}
