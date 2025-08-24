<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InvoiceUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'invoice_number' => ['required', 'string', 'max:255'],
            'invoice_date' => ['required', 'date'],
            'producer_id' => ['required'],
            'customer_id' => ['required'],
            'clinic_id' => ['required'],
            'store_id' => ['required'],
            'status_id' => ['required'],
            'currency_id' => ['required'],
            'tax_id' => ['required']
        ];
    }
}
