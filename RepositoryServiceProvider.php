<?php

namespace App\Providers;

use App\Repositories\Contracts\CustomerRepositoryInterface;
use App\Repositories\Contracts\MeasurementRepositoryInterface;
use App\Repositories\Contracts\OrderRepositoryInterface;
use App\Repositories\Contracts\TailorAssignmentRepositoryInterface;
use App\Repositories\Eloquent\CustomerRepository;
use App\Repositories\Eloquent\MeasurementRepository;
use App\Repositories\Eloquent\OrderRepository;
use App\Repositories\Eloquent\TailorAssignmentRepository;
use Illuminate\Support\ServiceProvider;

/**
 * Binds repository interfaces to their Eloquent implementations.
 * Swap an implementation (e.g. for testing with an in-memory repo, or
 * migrating to a different ORM/data store) by changing only this file —
 * no Service or Controller code needs to change. (Dependency Inversion.)
 */
class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(CustomerRepositoryInterface::class, CustomerRepository::class);
        $this->app->bind(MeasurementRepositoryInterface::class, MeasurementRepository::class);
        $this->app->bind(OrderRepositoryInterface::class, OrderRepository::class);
        $this->app->bind(TailorAssignmentRepositoryInterface::class, TailorAssignmentRepository::class);
    }
}
