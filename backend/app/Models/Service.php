<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    protected $fillable = [
        'name',
        'description',
        'category',
        'base_price',
        'specifications',
        'requires_design',
        'requires_team',
        'requires_size',
        'image_url',
        'status',
        'created_by',
    ];

    protected $casts = [
        'base_price' => 'float',
        'specifications' => 'array',
        'requires_design' => 'boolean',
        'requires_team' => 'boolean',
        'requires_size' => 'boolean',
    ];

    public function quotationItems(): HasMany
    {
        return $this->hasMany(QuotationItem::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
