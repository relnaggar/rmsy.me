<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Http;

class ContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:254'],
            'subject' => ['nullable', 'string'], // honeypot field
            'message' => ['required', 'string', 'max:5000'],
            'cf-turnstile-response' => ['required', 'string'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if (! $this->verifyTurnstile()) {
                $validator->errors()->add('cf-turnstile-response', 'CAPTCHA verification failed. Please try again.');
            }
        });
    }

    private function verifyTurnstile(): bool
    {
        $token = $this->input('cf-turnstile-response');
        $secretKey = config('services.turnstile.secret_key');

        if (empty($secretKey)) {
            // Skip verification in development if no key configured
            return true;
        }

        $response = Http::asForm()->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
            'secret' => $secretKey,
            'response' => $token,
            'remoteip' => $this->ip(),
        ]);

        return $response->json('success', false);
    }

    public function messages(): array
    {
        return [
            'cf-turnstile-response.required' => 'Please complete the CAPTCHA verification.',
        ];
    }
}
