<?php

namespace App\Http\Requests\Measurement;

use Illuminate\Foundation\Http\FormRequest;

class MeasurementStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $type = $this->input('type');

        $dataRules = match($type) {
            'shirt' => [
                'data.chest'    => 'required|numeric|min:1',
                'data.waist'    => 'required|numeric|min:1',
                'data.shoulder' => 'required|numeric|min:1',
                'data.sleeve'   => 'required|numeric|min:1',
                'data.neck'     => 'required|numeric|min:1',
                'data.length'   => 'required|numeric|min:1',
            ],
            'pant' => [
                'data.waist'  => 'required|numeric|min:1',
                'data.hip'    => 'required|numeric|min:1',
                'data.length' => 'required|numeric|min:1',
                'data.bottom' => 'required|numeric|min:1',
            ],
            'suit' => [
                'data.coat.chest'      => 'required|numeric|min:1',
                'data.coat.waist'      => 'required|numeric|min:1',
                'data.coat.shoulder'   => 'required|numeric|min:1',
                'data.coat.sleeve'     => 'required|numeric|min:1',
                'data.coat.neck'       => 'required|numeric|min:1',
                'data.coat.length'     => 'required|numeric|min:1',
                'data.trouser.waist'   => 'required|numeric|min:1',
                'data.trouser.hip'     => 'required|numeric|min:1',
                'data.trouser.length'  => 'required|numeric|min:1',
                'data.trouser.bottom'  => 'required|numeric|min:1',
            ],
            default => ['data' => 'required|array'],
        };

        return array_merge([
            'customer_id' => 'required|exists:customers,id',
            'type'        => 'required|in:shirt,pant,suit',
            'data'        => 'required|array',
            'notes'       => 'nullable|string',
        ], $dataRules);
    }
}
