<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    @hasSection('metaDescription')
      <meta name="description" content="@yield('metaDescription')">
    @endif
    @hasSection('metaRobots')
      <meta name="robots" content="@yield('metaRobots')">
    @endif

    <title>@yield('title', 'Untitled') | Ramsey El-Naggar</title>

    <link rel="icon" href="{{ asset('favicon.ico') }}" type="image/x-icon" />
    @vite(['resources/scss/styles.scss', 'resources/js/main.js'])
    <link
      rel="preload"
      href="{{ Vite::asset('resources/fonts/bootstrap-icons.woff2') }}"
      as="font"
      type="font/woff2"
      crossorigin
    >
    @stack('preload')
    <link rel="canonical" href="{{ url()->current() }}">
  </head>
  <!-- offest of 56 pixels for the unexpanded navbar height -->
  <body
    @if(isset($onThisPage) && count($onThisPage) > 0)
      data-bs-spy="scroll"
      data-bs-target="#sidebarMenu"
      data-bs-offset="56"
    @endif
    tabindex="0"
    class="position-relative"
  >
    <a href="#main" class="skip-link">Skip to content</a>
    <div class="container-fluid d-flex flex-column p-0">
      @include('partials.header')
      @include('partials.nav')
      <div class="d-lg-none">
        @include('partials.sidebar-collapsable')
      </div>
      <div class="d-flex flex-row">
        <div class="col-lg-2 col-md-1 d-none d-lg-block">
          @include('partials.sidebar-fixed')
        </div>
        @include('partials.main')
        @include('partials.fixed')
        <div class="col-lg-2 col-md-1 d-none d-lg-block">
        @include('partials.on-this-page-side')
        </div>
      </div>
      @include('partials.footer')
    </div>
  </body>
</html>
