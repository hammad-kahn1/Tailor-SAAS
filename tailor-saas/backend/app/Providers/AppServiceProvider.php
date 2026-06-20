<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Strict mode in non-production
        Model::shouldBeStrict(! $this->app->isProduction());

        // Prevent N+1 queries in development
        if ($this->app->environment('local')) {
            Model::preventLazyLoading();
            Model::preventSilentlyDiscardingAttributes();
        }

        // Log slow queries (>500ms) in local
        if ($this->app->environment('local')) {
            DB::listen(function ($query) {
                if ($query->time > 500) {
                    Log::warning('Slow query detected', [
                        'sql'      => $query->sql,
                        'bindings' => $query->bindings,
                        'time_ms'  => $query->time,
                    ]);
                }
            });
        }
    }
}
