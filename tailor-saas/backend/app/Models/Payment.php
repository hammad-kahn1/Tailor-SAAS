<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use BelongsToTenant;

    const TYPE_ADVANCE = 'advance';
    const TYPE_PARTIAL = 'partial';
    const TYPE_FINAL   = 'final';

    const METHOD_CASH           = 'cash';
    const METHOD_CARD           = 'card';
    const METHOD_BANK_TRANSFER  = 'bank_transfer';
    const METHOD_MOBILE_WALLET  = 'mobile_wallet';

    protected $fillable = [
        'tenant_id', 'order_id', 'amount', 'type',
        'method', 'notes', 'received_by', 'paid_at',
    ];

    protected $casts = [
        'amount'  => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function order(): BelongsTo       { return $this->belongsTo(Order::class); }
    public function receivedBy(): BelongsTo  { return $this->belongsTo(User::class, 'received_by'); }

    protected static function booted(): void
    {
        static::creating(function (self $payment) {
            if (! $payment->paid_at) {
                $payment->paid_at = now();
            }
            if (! $payment->received_by) {
                $payment->received_by = auth()->id();
            }
        });

        // Update the order's remaining_payment after each payment
        static::created(function (self $payment) {
            $order = $payment->order;
            if ($order) {
                $totalPaid = $order->payments()->sum('amount');
                $order->remaining_payment = max(0, $order->total_price - $totalPaid);
                $order->saveQuietly();
            }
        });
    }
}
