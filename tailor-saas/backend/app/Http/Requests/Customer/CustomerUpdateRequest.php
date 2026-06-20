<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class CustomerUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'full_name' => 'sometimes|string|max:255',
            'phone'     => 'sometimes|string|max:20',
            'email'     => 'nullable|email|max:255',
            'address'   => 'nullable|string',
            'gender'    => 'nullable|in:male,female,other',
            'notes'     => 'nullable|string',
        ];
    }
}
