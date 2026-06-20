<?php

namespace App\Repositories\Contracts;

interface CustomerRepositoryInterface
{
    public function paginate(array $filters, int $perPage = 15);
    public function findById(int $id);
    public function create(array $data);
    public function update(int $id, array $data);
    public function delete(int $id): bool;
    public function history(int $id): array;
}
