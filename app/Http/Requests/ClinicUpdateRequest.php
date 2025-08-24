<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ClinicUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:255'],
            'uraddress' => ['required', 'string', 'max:255'],
            'inn' => ['required', 'string', 'max:255'],
            'edrpou' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:255'],
            'currency_id' => ['required', 'integer', 'max:255']
        ];
    }
}
