<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class CustomerStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'full_name' => 'required|string|max:255',
            'phone'     => 'required|string|max:20',
            'email'     => 'nullable|email|max:255',
            'address'   => 'nullable|string',
            'gender'    => 'nullable|in:male,female,other',
            'notes'     => 'nullable|string',
        ];
    }
}
