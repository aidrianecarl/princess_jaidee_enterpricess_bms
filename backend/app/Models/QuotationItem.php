<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuotationItem extends Model
{
    protected $fillable = [
        'quotation_id',
        'service_id',
        'description',
        'quantity',
        'unit_price',
        'line_total',
        'design_file_url',
        'team_roster',
        'size_specifications',
        'notes',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'line_total' => 'decimal:2',
        'team_roster' => 'array',
        'size_specifications' => 'array',
        'notes' => 'array', // Cast notes JSON to array automatically
    ];

    public function quotation(): BelongsTo
    {
        return $this->belongsTo(Quotation::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
