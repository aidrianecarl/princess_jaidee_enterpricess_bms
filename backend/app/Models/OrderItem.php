<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'service_id',
        'quotation_items_id',
        'description',
        'quantity',
        'unit_price',
        'line_total',
        'status',
        'design_file_url',
        'team_roster',
        'size_specifications',
        'notes',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function quotationItem(): BelongsTo
    {
        return $this->belongsTo(QuotationItem::class, 'quotation_items_id');
    }
}
