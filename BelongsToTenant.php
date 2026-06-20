<?php

namespace App\Traits;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * BelongsToTenant
 *
 * Core of the multi-tenant row-isolation strategy.
 *
 * - Automatically scopes ALL queries on the model to the current tenant
 *   (resolved by ResolveTenant middleware and bound into the container).
 * - Automatically stamps tenant_id on creation.
 * - Super Admin (no tenant) can explicitly bypass via withoutTenantScope().
 *
 * Apply this trait to every tenant-owned Eloquent model.
 */
trait BelongsToTenant
{
    protected static function bootBelongsToTenant(): void
    {
        // Apply global scope to every query unless explicitly removed.
        static::addGlobalScope('tenant', function (Builder $builder) {
            if (app()->bound('currentTenantId') && app('currentTenantId')) {
                $builder->where(
                    $builder->getModel()->getTable() . '.tenant_id',
                    app('currentTenantId')
                );
            }
        });

        // Auto-fill tenant_id on create.
        static::creating(function (Model $model) {
            if (! $model->tenant_id && app()->bound('currentTenantId') && app('currentTenantId')) {
                $model->tenant_id = app('currentTenantId');
            }
        });
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Scope to explicitly bypass the tenant filter.
     * Only ever called from code already gated behind the `super_admin` role middleware.
     */
    public function scopeWithoutTenantScope(Builder $query): Builder
    {
        return $query->withoutGlobalScope('tenant');
    }
}
