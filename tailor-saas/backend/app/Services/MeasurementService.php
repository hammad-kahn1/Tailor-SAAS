<?php

namespace App\Services;

use App\Models\Measurement;

class MeasurementService
{
    public function store(array $data): Measurement
    {
        $data['version']     = Measurement::nextVersion($data['customer_id'], $data['type']);
        $data['recorded_by'] = auth()->id();

        return Measurement::create($data);
    }

    public function history(int $customerId, ?string $type)
    {
        return Measurement::where('customer_id', $customerId)
            ->when($type, fn ($q) => $q->where('type', $type))
            ->with('recordedBy:id,name')
            ->orderByDesc('version')
            ->get();
    }

    public function latest(int $customerId, string $type): ?Measurement
    {
        return Measurement::where('customer_id', $customerId)
            ->where('type', $type)
            ->orderByDesc('version')
            ->first();
    }
}
