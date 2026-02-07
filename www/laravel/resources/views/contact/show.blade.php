@extends('layouts.app')

@section('title', 'Contact')
@section('heading', 'Contact')
@section('metaDescription')
I'm always game to talk tech, education, or even dung beetles!
@endsection

@section('content')
@if(session('alert'))
  <x-alert :type="session('alert')['type']" :title="session('alert')['title']">
    @if(session('alert.type') === 'danger')
      There was an error sending your message.
      If the problem persists, please let me know via one of the other contact
      methods listed on this page.
      Apologies for the inconvenience!
    @elseif(session('submitted'))
      <p>
        Your message has been sent successfully! I'll get back to you as soon
        as I can.
      </p>
      <p>Here's what you sent:
        <ul>
          <li><strong>Name:</strong> {{ session('submitted.name') }}</li>
          <li><strong>Email:</strong> {{ session('submitted.email') }}</li>
          <li><strong>Message:</strong> {{ session('submitted.message') }}</li>
        </ul>
      </p>
    @else
      Your message has been sent successfully!
      I'll get back to you as soon as I can.
    @endif
  </x-alert>
@endif

<p class="lead">
  Got a burning question?
  Constructive criticism?
  Just want to chat about dung beetles?
</p>

<p>
  Feel free to ping me an email, submit the form below, or you can even send me
  a LinkedIn invitation.
  I've never lost a patient!
</p>

<div class="row">
  <div class="col-xxl-7 mb-3">
    <div class="card">
      <div class="card-header">
        <div class="mb-0 h6">Contact form</div>
      </div>
      <div class="card-body">
        <form
          action="{{ route('contact.submit') }}"
          method="post"
          class="needs-validation"
          novalidate
        >
          @csrf

          <x-form-input
            name="name"
            label="Name"
            autocomplete="on"
            required
            invalidFeedback="This field cannot be blank."
          />

          <x-form-input
            name="email"
            label="Email"
            type="email"
            autocomplete="on"
            required
            maxlength="254"
            invalidFeedback="This field cannot be blank and must be a valid
            email address less than or equal to 254 characters."
            formText="This will only be used so I can reply to your message.
            I'll never share your email with anyone."
          />

          <x-form-input
            name="subject"
            label="Subject"
            autocomplete="off"
            honeypot
          />

          <x-form-input
            name="message"
            label="Message"
            type="textarea"
            autocomplete="off"
            required
            maxlength="65534"
            invalidFeedback="This field cannot be blank and must be less than
            or equal to 65534 characters."
          />
          <div
            class="cf-turnstile mb-3"
            data-sitekey="{{ $turnstileSiteKey }}">
          </div>
          @error('cf-turnstile-response')
            <div class="text-danger mb-3">{{ $message }}</div>
          @enderror
          <input
            class="btn btn-primary"
            type="submit"
            name="submit"
            value="Submit"
          >
        </form>
      </div>
    </div>
  </div>
  <div class="col-xxl-5">
    @foreach($contactMethods as $contactMethod)
      <div
        class="card mb-3 {{ !empty($contactMethod['cta']) ? 'card-cta' : '' }}"
      >
        <div class="card-header">
          <div class="mb-0 h6">{{ $contactMethod['title'] }}</div>
        </div>
        <div class="card-body">
          <i class="bi bi-{{ $contactMethod['icon'] }}"></i>
          &nbsp;
          @if ($contactMethod['external'])
          <x-external-link href="{{ $contactMethod['href'] }}">
            {!! $contactMethod['html'] !!}
          </x-external-link>
          @else
          <a href="{{ $contactMethod['href'] }}">
            {!! $contactMethod['html'] !!}
          </a>
          @endif
        </div>
      </div>
    @endforeach
  </div>
</div>

<script
  src="https://challenges.cloudflare.com/turnstile/v0/api.js"
  defer
></script>
@endsection
