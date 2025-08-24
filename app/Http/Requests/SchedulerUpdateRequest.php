<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SchedulerUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'cabinet_id' => ['required'],
            'doctor_id' => ['required'],
            'event_date' => ['required'],
            'event_time_from' => ['required'],
            'event_time_to' => ['required'],
            'email' => ['nullable', 'sometimes|unique:patients']
        ];
    }
}
