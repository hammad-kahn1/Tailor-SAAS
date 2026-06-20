<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'tenant_id', 'user_id', 'action', 'model_type',
        'model_id', 'old_values', 'new_values', 'ip_address', 'user_agent',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'created_at' => 'datetime',
    ];

    const UPDATED_AT = null;

    protected static function booted(): void
    {
        static::creating(fn ($m) => $m->created_at = now());
    }

    public function user(): BelongsTo   { return $this->belongsTo(User::class); }
    public function tenant(): BelongsTo { return $this->belongsTo(Tenant::class); }

    // Scope: filter by date range
    public function scopeFromDate($q, ?string $from) { return $from ? $q->whereDate('created_at', '>=', $from) : $q; }
    public function scopeToDate($q, ?string $to)     { return $to   ? $q->whereDate('created_at', '<=', $to)   : $q; }
    public function scopeForModel($q, ?string $type) {
        if (! $type) return $q;
        return $q->where('model_type', 'like', "%{$type}%");
    }
}
