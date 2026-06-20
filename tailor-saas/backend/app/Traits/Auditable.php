<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;

/**
 * Auditable
 *
 * Automatically records created / updated / deleted events
 * to the audit_logs table using Eloquent model events.
 *
 * Apply this trait alongside BelongsToTenant on any model
 * that should maintain a full audit trail.
 */
trait Auditable
{
    protected static function bootAuditable(): void
    {
        static::created(function (Model $model) {
            static::writeAuditLog($model, 'created', null, $model->getAttributes());
        });

        static::updated(function (Model $model) {
            static::writeAuditLog($model, 'updated', $model->getOriginal(), $model->getChanges());
        });

        static::deleted(function (Model $model) {
            static::writeAuditLog($model, 'deleted', $model->getAttributes(), null);
        });
    }

    protected static function writeAuditLog(Model $model, string $action, ?array $oldValues, ?array $newValues): void
    {
        // Strip sensitive fields
        $sensitive = ['password', 'remember_token', 'api_token'];

        $old = $oldValues ? array_diff_key($oldValues, array_flip($sensitive)) : null;
        $new = $newValues ? array_diff_key($newValues, array_flip($sensitive)) : null;

        try {
            AuditLog::create([
                'tenant_id'  => $model->tenant_id ?? null,
                'user_id'    => auth()->id(),
                'action'     => $action,
                'model_type' => get_class($model),
                'model_id'   => $model->getKey(),
                'old_values' => $old,
                'new_values' => $new,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        } catch (\Throwable) {
            // Never let audit failure break the main request
        }
    }
}
