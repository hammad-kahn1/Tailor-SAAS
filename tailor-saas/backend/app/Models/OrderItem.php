<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'order_id', 'item_name', 'description',
        'quantity', 'unit_price', 'subtotal',
    ];

    protected $casts = [
        'quantity'   => 'integer',
        'unit_price' => 'decimal:2',
        'subtotal'   => 'decimal:2',
    ];

    public function order(): BelongsTo { return $this->belongsTo(Order::class); }

    /**
     * Automatically compute subtotal before saving.
     */
    protected static function booted(): void
    {
        static::saving(function (self $item) {
            $item->subtotal = $item->quantity * $item->unit_price;
        });
    }
}
