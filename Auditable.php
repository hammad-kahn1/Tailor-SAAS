<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;

/**
 * Auditable
 *
 * Attach to any model whose create/update/delete events should be
 * written to the audit_logs table automatically. Keeps controllers/services
 * free of manual logging calls for the common cases; services can still
 * write custom audit entries for domain events (e.g. "status_changed").
 */
trait Auditable
{
    protected static function bootAuditable(): void
    {
        static::created(function (Model $model) {
            AuditLog::write('created', $model, null, $model->getAttributes());
        });

        static::updated(function (Model $model) {
            AuditLog::write('updated', $model, $model->getOriginal(), $model->getChanges());
        });

        static::deleted(function (Model $model) {
            AuditLog::write('deleted', $model, $model->getAttributes(), null);
        });
    }
}
