<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'order_number',
        'quotation_id',
        'customer_id',
        'created_by',
        'branch_id',
        'order_date',
        'subtotal',
        'discount',
        'total',
        'payment_status',
        'order_status',
        'payment_method',
        'remaining_balance',
        'notes',
    ];

    protected $casts = [
        'order_date' => 'date',
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
        'remaining_balance' => 'decimal:2',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function quotation(): BelongsTo
    {
        return $this->belongsTo(Quotation::class);
    }

    public function job_order(): BelongsTo
    {
        return $this->belongsTo(JobOrder::class, 'id', 'order_id');
    }

    public function jobOrders(): HasMany
    {
        return $this->hasMany(JobOrder::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
