<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Rating;
use App\Models\Branch;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'phone_number',
        'address',
        'city',
        'province',
        'zip_code',
        'user_type',
        'status',
        'branch_id',
        'reset_code',
        'reset_code_expires_at',
        'reset_code_attempts',
        'last_password_reset_request_at',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        // 
    ];

    // Roles
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles');
    }

    // Permissions via roles
    public function permissions(): BelongsToMany
    {
        return $this->roles()->with('permissions')->get()->pluck('permissions')->flatten()->unique('id');
    }

    // Branch relationship
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    // Rating relationship
    public function rating(): HasOne
    {
        return $this->hasOne(Rating::class, 'customer_id');
    }

    // Check role
    public function hasRole($role): bool
    {
        return $this->roles()->where('name', $role)->exists();
    }

    // Check permission
    public function hasPermission($permission): bool
    {
        return $this->permissions()->contains('name', $permission);
    }

    public function canAccessAdmin(): bool
    {
        return $this->user_type !== 'client' || $this->hasRole('admin') || $this->hasRole('manager');
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }
}
