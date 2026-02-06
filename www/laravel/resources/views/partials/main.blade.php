<main class="flex-grow-1 m-5 d-flex flex-column min-vh-100" id="main">
  @if(session('success'))
    <x-alert type="success" :message="session('success')" />
  @endif
  @if(session('error'))
    <x-alert type="danger" :message="session('error')" />
  @endif
  @if($errors->any())
    <x-alert type="danger">
      <ul class="mb-0">
        @foreach($errors->all() as $error)
          <li>{{ $error }}</li>
        @endforeach
      </ul>
    </x-alert>
  @endif
  <h1>@yield('heading')</h1>
  @hasSection('subtitle')
    <div class="text-body-secondary h3">
      @yield('subtitle')
    </div>
  @endif
  @include('partials.previous-next-buttons')
  <div class="mt-3">
    @yield('content')
  </div>
  @yield('sections')
  @include('partials.previous-next-buttons')
</main>