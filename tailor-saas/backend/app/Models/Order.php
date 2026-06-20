<?php

namespace App\Models;

use App\Traits\Auditable;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Order extends Model
{
    use BelongsToTenant, Auditable;

    // Status constants
    const STATUS_PENDING     = 'pending';
    const STATUS_ASSIGNED    = 'assigned';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_READY       = 'ready';
    const STATUS_DELIVERED   = 'delivered';
    const STATUS_CANCELLED   = 'cancelled';

    protected $fillable = [
        'tenant_id', 'order_number', 'customer_id', 'measurement_id',
        'status', 'total_price', 'advance_payment', 'remaining_payment',
        'delivery_date', 'notes', 'created_by',
    ];

    protected $casts = [
        'total_price'       => 'decimal:2',
        'advance_payment'   => 'decimal:2',
        'remaining_payment' => 'decimal:2',
        'delivery_date'     => 'date',
    ];

    // ── Relationships ─────────────────────────────────────
    public function tenant(): BelongsTo      { return $this->belongsTo(Tenant::class); }
    public function customer(): BelongsTo    { return $this->belongsTo(Customer::class); }
    public function measurement(): BelongsTo { return $this->belongsTo(Measurement::class); }
    public function createdBy(): BelongsTo   { return $this->belongsTo(User::class, 'created_by'); }
    public function items(): HasMany         { return $this->hasMany(OrderItem::class); }
    public function payments(): HasMany      { return $this->hasMany(Payment::class); }
    public function assignment(): HasOne     { return $this->hasOne(TailorAssignment::class); }

    // ── Scopes ────────────────────────────────────────────
    public function scopeForStatus($query, ?string $status)
    {
        if (!$status) return $query;
        return $query->where('status', $status);
    }

    public function scopeSearch($query, ?string $term)
    {
        if (!$term) return $query;
        return $query->where(function ($q) use ($term) {
            $q->where('order_number', 'like', "%{$term}%")
              ->orWhereHas('customer', fn($cq) =>
                  $cq->where('full_name', 'like', "%{$term}%")
                     ->orWhere('phone', 'like', "%{$term}%")
              );
        });
    }

    // ── Order Number Generator ────────────────────────────
    public static function generateOrderNumber(): string
    {
        $date   = now()->format('Ymd');
        $random = strtoupper(Str::random(4));
        return "ORD-{$date}-{$random}";
    }

    // ── Helpers ───────────────────────────────────────────
    public function isPaid(): bool
    {
        return (float) $this->remaining_payment <= 0;
    }

    public function isEditable(): bool
    {
        return in_array($this->status, [self::STATUS_PENDING, self::STATUS_ASSIGNED]);
    }
}
