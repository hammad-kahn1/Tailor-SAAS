<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    protected $fillable = [
        'tenant_id', 'plan', 'status', 'price',
        'starts_at', 'ends_at',
    ];

    protected $casts = [
        'price'     => 'decimal:2',
        'starts_at' => 'datetime',
        'ends_at'   => 'datetime',
    ];

    public function tenant(): BelongsTo { return $this->belongsTo(Tenant::class); }

    public function isActive(): bool
    {
        return $this->status === 'active'
            && (! $this->ends_at || $this->ends_at->isFuture());
    }
}
