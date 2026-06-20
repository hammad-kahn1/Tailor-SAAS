<?php

namespace App\Models;

use App\Traits\Auditable;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable, BelongsToTenant, Auditable;

    protected $fillable = [
        'tenant_id', 'name', 'email', 'password',
        'role', 'phone', 'is_active',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
        'is_active'         => 'boolean',
    ];

    // ── Relationships ─────────────────────────────────────
    public function tenant()      { return $this->belongsTo(Tenant::class); }
    public function assignments() { return $this->hasMany(TailorAssignment::class, 'tailor_id'); }

    // ── Role helpers ──────────────────────────────────────
    public function isSuperAdmin(): bool  { return $this->role === 'super_admin'; }
    public function isShopOwner(): bool   { return $this->role === 'shop_owner'; }
    public function isManager(): bool     { return $this->role === 'manager'; }
    public function isTailor(): bool      { return $this->role === 'tailor'; }
    public function isReceptionist(): bool{ return $this->role === 'receptionist'; }
    public function hasRole(string ...$roles): bool { return in_array($this->role, $roles); }

    // ── Local Scopes ──────────────────────────────────────
    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopeRole($query, string $role)
    {
        return $query->where('role', $role);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
