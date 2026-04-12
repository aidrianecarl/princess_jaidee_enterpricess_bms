<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Quotation extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'quotation_number',
        'customer_id',
        'created_by',
        'branch_id',
        'logo_url',
        'business_name',
        'business_address',
        'business_city',
        'business_state',
        'business_postal',
        'business_phone',
        'business_email',
        'subtotal',
        'discount',
        'paid_amount',
        'total',
        'currency',
        'status',
        'notes',
        'terms_conditions',
        'valid_until',
        'scheduled_send_date',
        'sent_at',
        'has_price',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'valid_until' => 'date',
        'scheduled_send_date' => 'datetime',
        'sent_at' => 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(QuotationItem::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }
}
