<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\PasswordReset;

class AuthService
{
    public function registerTenant(array $data): array
    {
        $tenant = Tenant::create([
            'name'               => $data['shop_name'],
            'slug'               => Str::slug($data['shop_name']).'-'.Str::random(4),
            'email'              => $data['email'],
            'phone'              => $data['phone'] ?? null,
            'subscription_plan'  => 'trial',
            'subscription_status'=> 'active',
            'trial_ends_at'      => now()->addDays(14),
        ]);

        $user = User::create([
            'tenant_id' => $tenant->id,
            'name'      => $data['name'],
            'email'     => $data['email'],
            'password'  => Hash::make($data['password']),
            'role'      => 'shop_owner',
            'is_active' => true,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return ['user' => $user->load('tenant'), 'token' => $token];
    }

    public function login(string $email, string $password): array
    {
        $user = User::with('tenant')->where('email', $email)->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            throw new \Illuminate\Validation\ValidationException(
                validator([], []),
                response()->json(['message' => 'Invalid credentials.', 'errors' => ['email' => ['These credentials do not match our records.']]], 422)
            );
        }

        if (! $user->is_active) {
            abort(403, 'Your account has been deactivated.');
        }

        $user->tokens()->delete(); // single-session: revoke old tokens
        $token = $user->createToken('auth_token')->plainTextToken;

        return ['user' => $user, 'token' => $token];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }

    public function changePassword(User $user, string $current, string $new): void
    {
        if (! Hash::check($current, $user->password)) {
            throw new \Illuminate\Validation\ValidationException(
                validator([], []),
                response()->json(['message' => 'Current password is incorrect.', 'errors' => ['current_password' => ['Current password is incorrect.']]], 422)
            );
        }
        $user->update(['password' => Hash::make($new)]);
    }
}
