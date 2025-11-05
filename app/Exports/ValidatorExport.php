<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class ValidatorExport implements FromCollection, WithHeadings
{
    protected $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    /**
     * @return Collection
     */
    public function collection()
    {
        // Convert array data to Collection
        return collect($this->data);
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        // Define your column headers here based on your validator data structure
        return [
            'ID',
            'Vote Public Key',
            'Node Public Key', 
            'Name',
            'Activated Stake',
            'Commission',
            // Add more column headers as needed based on your data structure
        ];
    }
}