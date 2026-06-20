<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TailorAssignment extends Model
{
    use BelongsToTenant;

    const STATUS_ASSIGNED    = 'assigned';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_COMPLETED   = 'completed';

    protected $fillable = [
        'tenant_id', 'order_id', 'tailor_id', 'assigned_by',
        'status', 'notes', 'started_at', 'completed_at', 'assigned_at',
    ];

    protected $casts = [
        'started_at'   => 'datetime',
        'completed_at' => 'datetime',
        'assigned_at'  => 'datetime',
    ];

    public function order(): BelongsTo      { return $this->belongsTo(Order::class); }
    public function tailor(): BelongsTo     { return $this->belongsTo(User::class, 'tailor_id'); }
    public function assignedBy(): BelongsTo { return $this->belongsTo(User::class, 'assigned_by'); }

    // ── Auto-timestamps for workflow ──────────────────────
    protected static function booted(): void
    {
        static::updating(function (self $assignment) {
            if ($assignment->isDirty('status')) {
                if ($assignment->status === self::STATUS_IN_PROGRESS && ! $assignment->started_at) {
                    $assignment->started_at = now();
                }
                if ($assignment->status === self::STATUS_COMPLETED && ! $assignment->completed_at) {
                    $assignment->completed_at = now();
                }
            }
        });
    }

    // ── Scopes ────────────────────────────────────────────
    public function scopeForTailor($query, int $tailorId)
    {
        return $query->where('tailor_id', $tailorId);
    }

    public function scopeStatus($query, ?string $status)
    {
        return $status ? $query->where('status', $status) : $query;
    }
}
