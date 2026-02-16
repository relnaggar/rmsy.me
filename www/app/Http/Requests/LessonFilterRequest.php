<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LessonFilterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'buyer_id' => ['nullable', 'string', 'max:100', 'exists:buyers,id'],
            'student_id' => ['nullable', 'integer', 'exists:students,id'],
            'client_id' => ['nullable', 'integer', 'exists:clients,id'],
        ];
    }
}
