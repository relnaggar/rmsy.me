<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ContactTest extends TestCase
{
    use RefreshDatabase;

    private function fakeTurnstileSuccess(): void
    {
        Http::fake([
            'challenges.cloudflare.com/*' => Http::response(['success' => true]),
        ]);
    }

    private function fakeTurnstileFailure(): void
    {
        Http::fake([
            'challenges.cloudflare.com/*' => Http::response(['success' => false]),
        ]);
    }

    public function test_contact_page_renders(): void
    {
        $response = $this->get(route('contact.show'));

        $response->assertStatus(200);
        $response->assertSee('Contact');
    }

    public function test_submit_with_valid_data_sends_email(): void
    {
        $this->fakeTurnstileSuccess();
        Mail::shouldReceive('html')->once();

        $response = $this->post(route('contact.submit'), [
            'name' => 'John Doe',
            'email' => 'john@gmail.com',
            'message' => 'Hello, I would like to enquire about tutoring.',
            'cf-turnstile-response' => 'fake-token',
        ]);

        $response->assertRedirect(route('contact.show'));
        $response->assertSessionHas('alert.type', 'success');
        $response->assertSessionHas('alert.title', 'Message sent!');
    }

    public function test_submit_with_honeypot_does_not_send_email(): void
    {
        $this->fakeTurnstileSuccess();
        Mail::shouldReceive('html')->never();

        $response = $this->post(route('contact.submit'), [
            'name' => 'Bot',
            'email' => 'bot@gmail.com',
            'subject' => 'I am a bot filling in the hidden field',
            'message' => 'Buy my stuff!',
            'cf-turnstile-response' => 'fake-token',
        ]);

        $response->assertRedirect(route('contact.show'));
        $response->assertSessionHas('alert.type', 'success');
    }

    public function test_submit_validates_name_required(): void
    {
        $this->fakeTurnstileSuccess();

        $response = $this->post(route('contact.submit'), [
            'email' => 'john@example.com',
            'message' => 'Hello',
            'cf-turnstile-response' => 'fake-token',
        ]);

        $response->assertSessionHasErrors('name');
    }

    public function test_submit_validates_email_required(): void
    {
        $this->fakeTurnstileSuccess();

        $response = $this->post(route('contact.submit'), [
            'name' => 'John',
            'message' => 'Hello',
            'cf-turnstile-response' => 'fake-token',
        ]);

        $response->assertSessionHasErrors('email');
    }

    public function test_submit_validates_email_format(): void
    {
        $this->fakeTurnstileSuccess();

        $response = $this->post(route('contact.submit'), [
            'name' => 'John',
            'email' => 'not-an-email',
            'message' => 'Hello',
            'cf-turnstile-response' => 'fake-token',
        ]);

        $response->assertSessionHasErrors('email');
    }

    public function test_submit_validates_message_required(): void
    {
        $this->fakeTurnstileSuccess();

        $response = $this->post(route('contact.submit'), [
            'name' => 'John',
            'email' => 'john@example.com',
            'cf-turnstile-response' => 'fake-token',
        ]);

        $response->assertSessionHasErrors('message');
    }

    public function test_submit_validates_turnstile_required(): void
    {
        $response = $this->post(route('contact.submit'), [
            'name' => 'John',
            'email' => 'john@example.com',
            'message' => 'Hello',
        ]);

        $response->assertSessionHasErrors('cf-turnstile-response');
    }

    public function test_submit_fails_with_invalid_turnstile(): void
    {
        $this->fakeTurnstileFailure();

        $response = $this->post(route('contact.submit'), [
            'name' => 'John',
            'email' => 'john@gmail.com',
            'message' => 'Hello',
            'cf-turnstile-response' => 'invalid-token',
        ]);

        $response->assertSessionHasErrors('cf-turnstile-response');
    }

    public function test_submit_rate_limited_after_three_attempts(): void
    {
        $this->fakeTurnstileSuccess();
        Mail::shouldReceive('html')->times(3);

        $data = [
            'name' => 'John',
            'email' => 'john@gmail.com',
            'message' => 'Hello',
            'cf-turnstile-response' => 'fake-token',
        ];

        for ($i = 0; $i < 3; $i++) {
            $this->post(route('contact.submit'), $data);
        }

        $response = $this->post(route('contact.submit'), $data);

        $response->assertStatus(429);
    }

    public function test_submit_handles_mail_failure(): void
    {
        $this->fakeTurnstileSuccess();
        Mail::shouldReceive('html')->once()->andThrow(new \Exception('SMTP error'));

        $response = $this->post(route('contact.submit'), [
            'name' => 'John',
            'email' => 'john@gmail.com',
            'message' => 'Hello',
            'cf-turnstile-response' => 'fake-token',
        ]);

        $response->assertRedirect(route('contact.show'));
        $response->assertSessionHas('alert.type', 'danger');
        $response->assertSessionHas('alert.title', 'Message send failure!');
    }
}
