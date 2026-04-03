<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    protected $fillable = [
        'quotation_id',
        'bill_to_name',
        'bill_to_street',
        'bill_to_city',
        'bill_to_state',
        'bill_to_postal',
        'bill_to_phone',
        'bill_to_email',
    ];

    protected $appends = ['name', 'email', 'phone'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function quotations(): HasMany
    {
        return $this->hasMany(Quotation::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function jobOrders(): HasMany
    {
        return $this->hasMany(JobOrder::class);
    }

    // Accessors for compatibility with frontend expectations
    public function getNameAttribute()
    {
        return $this->bill_to_name ?? '';
    }

    public function getEmailAttribute()
    {
        return $this->bill_to_email ?? '';
    }

    public function getPhoneAttribute()
    {
        return $this->bill_to_phone ?? '';
    }
}
