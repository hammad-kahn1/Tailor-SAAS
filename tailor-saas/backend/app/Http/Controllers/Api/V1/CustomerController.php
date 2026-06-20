<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\CustomerStoreRequest;
use App\Http\Requests\Customer\CustomerUpdateRequest;
use App\Repositories\Contracts\CustomerRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function __construct(private CustomerRepositoryInterface $customers) {}

    public function index(Request $request): JsonResponse
    {
        $data = $this->customers->paginate($request->only('search','gender'), (int)$request->get('per_page', 15));
        return response()->json($data);
    }

    public function store(CustomerStoreRequest $request): JsonResponse
    {
        $customer = $this->customers->create($request->validated());
        return response()->json(['message' => 'Customer created.', 'data' => $customer], 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(['data' => $this->customers->findById($id)]);
    }

    public function update(CustomerUpdateRequest $request, int $id): JsonResponse
    {
        $customer = $this->customers->update($id, $request->validated());
        return response()->json(['message' => 'Customer updated.', 'data' => $customer]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->customers->delete($id);
        return response()->json(['message' => 'Customer deleted.']);
    }

    public function history(int $id): JsonResponse
    {
        return response()->json(['data' => $this->customers->history($id)]);
    }
}
