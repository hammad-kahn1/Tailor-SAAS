<?php

namespace App\Models;

use App\Traits\Auditable;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;

class Customer extends Model
{
    use BelongsToTenant, Auditable, Notifiable;

    protected $fillable = [
        'tenant_id', 'full_name', 'phone', 'email',
        'address', 'gender', 'notes', 'created_by',
    ];

    // ── Relationships ─────────────────────────────────────
    public function tenant(): BelongsTo     { return $this->belongsTo(Tenant::class); }
    public function createdBy(): BelongsTo  { return $this->belongsTo(User::class, 'created_by'); }
    public function measurements(): HasMany { return $this->hasMany(Measurement::class); }
    public function orders(): HasMany       { return $this->hasMany(Order::class); }

    // ── Local Scopes ──────────────────────────────────────
    public function scopeSearch($query, ?string $term)
    {
        if (! $term) return $query;
        return $query->where(function ($q) use ($term) {
            $q->where('full_name', 'like', "%{$term}%")
              ->orWhere('phone', 'like', "%{$term}%")
              ->orWhere('email', 'like', "%{$term}%");
        });
    }

    public function scopeGender($query, ?string $gender)
    {
        if (! $gender) return $query;
        return $query->where('gender', $gender);
    }
}
