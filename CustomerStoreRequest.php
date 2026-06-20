<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CustomerStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole(['shop_owner', 'manager', 'receptionist']);
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:1000'],
            'gender' => ['nullable', 'in:male,female,other'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
