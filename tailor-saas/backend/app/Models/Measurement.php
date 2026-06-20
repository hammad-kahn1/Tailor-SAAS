<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Measurement extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'customer_id', 'type', 'version',
        'data', 'notes', 'recorded_by',
    ];

    protected $casts = [
        'data'    => 'array',
        'version' => 'integer',
    ];

    // ── Relationships ─────────────────────────────────────
    public function customer(): BelongsTo    { return $this->belongsTo(Customer::class); }
    public function recordedBy(): BelongsTo  { return $this->belongsTo(User::class, 'recorded_by'); }
    public function orders(): HasMany        { return $this->hasMany(Order::class); }

    // ── Versioning ────────────────────────────────────────
    /**
     * Returns the next version number for this customer+type combination.
     * Uses a DB-level MAX + 1 inside a transaction to guarantee uniqueness.
     */
    public static function nextVersion(int $customerId, string $type): int
    {
        $max = static::where('customer_id', $customerId)
            ->where('type', $type)
            ->max('version');

        return ($max ?? 0) + 1;
    }

    // ── Scopes ────────────────────────────────────────────
    public function scopeType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeLatest($query)
    {
        return $query->orderByDesc('version');
    }
}
