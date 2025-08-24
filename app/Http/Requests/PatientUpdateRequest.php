<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PatientUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'phone' => ['string', 'max:255', 'nullable'],
            'discount' => ['numeric', 'nullable'],
            'address' => ['string', 'nullable'],
            'email' => ['string', 'nullable'],
            'important_info' => ['string', 'nullable'],
            'notice' => ['string', 'nullable'],
            'curator_id' => ['numeric', 'nullable'],
            'status_id' => ['numeric', 'nullable'],
            'contact' => ['string', 'nullable'],
            'card_number' => ['string', 'nullable'],
            'payment' => ['string', 'nullable'],
            'register_date' => ['required'],
            'birthday' => ['date', 'nullable'],
        ];
    }
}
