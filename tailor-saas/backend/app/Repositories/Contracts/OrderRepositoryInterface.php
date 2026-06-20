<?php

namespace App\Repositories\Contracts;

interface OrderRepositoryInterface
{
    public function paginate(array $filters, int $perPage = 15);
    public function findById(int $id);
    public function create(array $data, array $items): mixed;
    public function updateStatus(int $id, string $status, ?string $notes): mixed;
}
