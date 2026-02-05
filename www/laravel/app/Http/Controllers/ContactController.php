<?php

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
    ) {}

    public function show(): View
    {
        return view('contact.show', [
            'contactMethods' => $this->contactMethodsService->getContactMethods(),
            'turnstileSiteKey' => config('services.turnstile.site_key'),
        ]);
    }

    public function submit(ContactRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        // Check honeypot field
        if (! empty($validated['subject'])) {
            // Bot detected, pretend success
            return redirect()->route('contact.show')
                ->with('success', 'Thank you for your message! I will get back to you soon.');
        }

        // Send email
        Mail::raw(
            "Name: {$validated['name']}\nEmail: {$validated['email']}\n\nMessage:\n{$validated['message']}",
            function ($message) use ($validated) {
                $message->to(config('mail.contact_recipient', 'ramsey.el-naggar@outlook.com'))
                    ->from(config('mail.from.address'), config('mail.from.name'))
                    ->replyTo($validated['email'], $validated['name'])
                    ->subject('Contact Form: '.$validated['name']);
            }
        );

        return redirect()->route('contact.show')
            ->with('success', 'Thank you for your message! I will get back to you soon.');
    }
}
