<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Tenant extends Model
{
    protected $fillable = [
        'name', 'slug', 'email', 'phone', 'address', 'logo',
        'subscription_plan', 'subscription_status', 'trial_ends_at',
        'is_active', 'settings',
    ];

    protected $casts = [
        'settings'       => 'array',
        'trial_ends_at'  => 'datetime',
        'is_active'      => 'boolean',
    ];

    public function users(): HasMany        { return $this->hasMany(User::class); }
    public function customers(): HasMany    { return $this->hasMany(Customer::class); }
    public function orders(): HasMany       { return $this->hasMany(Order::class); }
    public function subscription(): HasOne  { return $this->hasOne(Subscription::class)->latestOfMany(); }

    // Convenience scope for super-admin
    public function scopeWithoutTenantScope($query)
    {
        return $query;
    }

    public function isOnTrial(): bool
    {
        return $this->subscription_plan === 'trial'
            && $this->trial_ends_at
            && $this->trial_ends_at->isFuture();
    }

    public function isActive(): bool
    {
        return (bool) $this->is_active;
    }
}
