<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\ContactRequest;
use App\Services\ContactMethodsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\View\View;

class ContactController extends Controller
{
    public function __construct(
        private ContactMethodsService $contactMethodsService,
    ) {
    }

    private function viewData(): array
    {
        return [
            'contactMethods' => $this->contactMethodsService->getContactMethods(),
            'turnstileSiteKey' => config('services.turnstile.site_key'),
        ];
    }

    public function show(): View
    {
        return view('contact.show', $this->viewData());
    }

    public function submit(ContactRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        // Check honeypot field
        if (! empty($validated['subject'])) {
            // Bot detected, pretend success
            return redirect()->route('contact.show')->with('alert', [
                'type' => 'success',
                'title' => 'Message sent!',
            ]);
        }

        // Send email
        try {
            Mail::html(
                nl2br($validated['message'], false),
                function ($mail) use ($validated) {
                    $mail->to(
                        config('mail.contact_recipient.address'),
                        config('mail.contact_recipient.name'),
                    )
                        ->replyTo($validated['email'], $validated['name'])
                        ->subject(
                            "From {$validated['name']} <{$validated['email']}>"
                        );
                }
            );
        } catch (\Exception $e) {
            report($e);

            return redirect()->route('contact.show')
                ->withInput()
                ->with('alert', [
                    'type' => 'danger',
                    'title' => 'Message send failure!',
                ]);
        }

        // Success
        return redirect()->route('contact.show')->with([
            'alert' => [
                'type' => 'success',
                'title' => 'Message sent!',
            ],
            'submitted' => $request->only(['name', 'email', 'message']),
        ]);
    }
}
