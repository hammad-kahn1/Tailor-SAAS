<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class OrderStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'customer_id'     => 'required|exists:customers,id',
            'measurement_id'  => 'nullable|exists:measurements,id',
            'delivery_date'   => 'required|date|after_or_equal:today',
            'advance_payment' => 'nullable|numeric|min:0',
            'notes'           => 'nullable|string',
            'items'                  => 'required|array|min:1',
            'items.*.item_name'      => 'required|string|max:255',
            'items.*.quantity'       => 'required|integer|min:1',
            'items.*.unit_price'     => 'required|numeric|min:0.01',
        ];
    }
}
