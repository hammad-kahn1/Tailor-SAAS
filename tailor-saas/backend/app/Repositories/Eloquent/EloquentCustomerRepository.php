<?php

namespace App\Repositories\Eloquent;

use App\Models\Customer;
use App\Repositories\Contracts\CustomerRepositoryInterface;

class EloquentCustomerRepository implements CustomerRepositoryInterface
{
    public function paginate(array $filters, int $perPage = 15)
    {
        return Customer::query()
            ->with(['createdBy:id,name'])
            ->search($filters['search'] ?? null)
            ->gender($filters['gender'] ?? null)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function findById(int $id)
    {
        return Customer::with(['measurements' => fn($q) => $q->orderByDesc('version'), 'orders'])
            ->findOrFail($id);
    }

    public function create(array $data)
    {
        $data['created_by'] = auth()->id();
        return Customer::create($data);
    }

    public function update(int $id, array $data)
    {
        $customer = Customer::findOrFail($id);
        $customer->update($data);
        return $customer->fresh();
    }

    public function delete(int $id): bool
    {
        return Customer::findOrFail($id)->delete();
    }

    public function history(int $id): array
    {
        $customer = Customer::with([
            'measurements' => fn($q) => $q->orderByDesc('version'),
            'orders'       => fn($q) => $q->with(['items', 'assignment.tailor:id,name'])->orderByDesc('created_at'),
        ])->findOrFail($id);

        return [
            'customer'     => $customer,
            'measurements' => $customer->measurements,
            'orders'       => $customer->orders,
        ];
    }
}
