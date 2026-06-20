<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterTenantRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;

class AuthController extends Controller
{
    public function __construct(private AuthService $auth) {}

    public function registerTenant(RegisterTenantRequest $request): JsonResponse
    {
        $result = $this->auth->registerTenant($request->validated());
        return response()->json(['message' => 'Shop registered successfully.', 'data' => $result], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->auth->login($request->email, $request->password);
        return response()->json(['message' => 'Login successful.', 'data' => $result]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['data' => $request->user()->load('tenant')]);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->auth->logout($request->user());
        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $this->auth->changePassword($request->user(), $request->current_password, $request->password);
        return response()->json(['message' => 'Password changed successfully.']);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);
        Password::sendResetLink(['email' => $request->email]);
        return response()->json(['message' => 'If that email exists, a reset link has been sent.']);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token'    => 'required',
            'email'    => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $status = Password::reset($request->only('email','password','password_confirmation','token'),
            function ($user, $password) { $user->update(['password' => bcrypt($password)]); }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Password has been reset.']);
        }
        return response()->json(['message' => __($status)], 422);
    }
}
