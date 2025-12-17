<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceSizePricing extends Model
{
    protected $table = 'service_size_pricing';

    protected $fillable = [
        'service_id',
        'size_type',
        'min_value',
        'max_value',
        'price_multiplier',
        'description',
    ];

    protected $casts = [
        'min_value' => 'decimal:2',
        'max_value' => 'decimal:2',
        'price_multiplier' => 'decimal:2',
    ];

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
