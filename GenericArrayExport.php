<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

/**
 * Generic flattening exporter used by ReportController for "format=excel".
 * For bespoke column ordering/formatting per report, create a dedicated
 * ...Export class implementing FromCollection + WithHeadings + WithMapping
 * (e.g. DailySalesExport, TailorPerformanceExport) and swap it in.
 */
class GenericArrayExport implements FromCollection, WithHeadings
{
    public function __construct(protected Collection $rows)
    {
    }

    public function collection()
    {
        return $this->rows->map(function ($row) {
            $row = is_array($row) ? $row : (array) $row;
            // Flatten nested arrays/objects to a single level for spreadsheet cells.
            return collect($row)->mapWithKeys(function ($value, $key) {
                if (is_array($value) || is_object($value)) {
                    $value = json_encode($value);
                }
                return [$key => $value];
            });
        });
    }

    public function headings(): array
    {
        $first = $this->rows->first();
        if (! $first) {
            return [];
        }
        return array_keys(is_array($first) ? $first : (array) $first);
    }
}
