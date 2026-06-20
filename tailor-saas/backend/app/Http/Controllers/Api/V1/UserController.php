<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $users = User::where('tenant_id', $request->user()->tenant_id)
            ->where('role', '!=', 'super_admin')
            ->orderBy('name')
            ->get(['id','name','email','role','phone','is_active','created_at']);
        return response()->json(['data' => $users]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'password' => 'required|min:8',
            'role'     => 'required|in:manager,tailor,receptionist',
            'phone'    => 'nullable|string',
        ]);

        $user = User::create([
            'tenant_id' => $request->user()->tenant_id,
            'name'      => $request->name,
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'role'      => $request->role,
            'phone'     => $request->phone,
            'is_active' => true,
        ]);

        return response()->json(['message' => 'Staff member created.', 'data' => $user], 201);
    }

    public function update(Request $request, int $user): JsonResponse
    {
        $request->validate([
            'role'      => 'sometimes|in:manager,tailor,receptionist',
            'is_active' => 'sometimes|boolean',
            'name'      => 'sometimes|string|max:255',
            'phone'     => 'nullable|string',
        ]);

        $found = User::where('tenant_id', $request->user()->tenant_id)->findOrFail($user);
        $found->update($request->validated());
        return response()->json(['message' => 'Staff member updated.', 'data' => $found]);
    }

    public function show(Request $request, int $user): JsonResponse
    {
        $found = User::where('tenant_id', $request->user()->tenant_id)
            ->where('role', '!=', 'super_admin')
            ->findOrFail($user);
        return response()->json(['data' => $found]);
    }

    public function tailors(Request $request): JsonResponse
    {
        $tailors = User::where('tenant_id', $request->user()->tenant_id)
            ->where('role', 'tailor')
            ->where('is_active', true)
            ->get(['id','name']);
        return response()->json(['data' => $tailors]);
    }
}
