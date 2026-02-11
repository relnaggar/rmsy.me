<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Client\Response;
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
            'name' => ['required', 'string', 'max:254'],
            'email' => ['required', 'email:rfc,dns', 'max:254'],
            'subject' => [], // honeypot field
            'message' => ['required', 'string', 'max:65534'],
            'cf-turnstile-response' => ['required', 'string'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if (! $this->verifyTurnstile()) {
                $validator->errors()->add(
                    'cf-turnstile-response',
                    'CAPTCHA verification failed. Please try again.'
                );
            }
        });
    }

    private function verifyTurnstile(): bool
    {
        $token = $this->input('cf-turnstile-response');
        $secretKey = config('services.turnstile.secret_key');

        /** @var Response $response */
        $response = Http::asForm()->post(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            [
                'secret' => $secretKey,
                'response' => $token,
                'remoteip' => $this->ip(),
            ]
        );

        return $response->json('success', false);
    }

    public function messages(): array
    {
        return [
            'cf-turnstile-response.required' => 'Please complete the CAPTCHA verification.',
        ];
    }
}
