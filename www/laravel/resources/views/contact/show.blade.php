@extends('layouts.app')

@section('title', 'Contact')
@section('heading', 'Contact Me')
@section('metaDescription', 'Get in touch with Ramsey El-Naggar.')

@section('content')
<div class="row">
  <div class="col-lg-7">
    <form method="POST" action="{{ route('contact.submit') }}" class="needs-validation" novalidate>
      @csrf

      <x-form-input
        name="name"
        label="Name"
        :required="true"
        maxlength="255"
      />

      <x-form-input
        name="email"
        label="Email"
        type="email"
        :required="true"
        maxlength="254"
      />

      {{-- Honeypot field --}}
      <div class="subject">
        <x-form-input
          name="subject"
          label="Subject"
        />
      </div>

      <x-form-input
        name="message"
        label="Message"
        type="textarea"
        :required="true"
        rows="5"
        maxlength="5000"
      />

      @if($turnstileSiteKey)
        <div class="mb-3">
          <div class="cf-turnstile" data-sitekey="{{ $turnstileSiteKey }}"></div>
          @error('cf-turnstile-response')
            <div class="text-danger">{{ $message }}</div>
          @enderror
        </div>
        <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
      @endif

      <button type="submit" class="btn btn-primary">Send Message</button>
    </form>
  </div>

  <div class="col-lg-5">
    <h3>Other Ways to Reach Me</h3>
    <div class="row">
      @foreach($contactMethods as $method)
        <div class="col-sm-6 mb-3">
          <div class="card {{ !empty($method['cta']) ? 'card-cta' : '' }}">
            <div class="card-header">
              <i class="bi bi-{{ $method['icon'] }}"></i> {{ $method['title'] }}
            </div>
            <div class="card-body">
              <a
                href="{{ $method['href'] }}"
                @if($method['external'] ?? false) target="_blank" rel="noopener noreferrer" @endif
              >
                {!! $method['html'] !!}
              </a>
            </div>
          </div>
        </div>
      @endforeach
    </div>
  </div>
</div>
@endsection
