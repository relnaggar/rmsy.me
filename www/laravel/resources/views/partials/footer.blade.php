<footer class="text-center bg-primary p-5 text-white">
  <nav>
    <ul class="list-inline mb-4" aria-label="Social media links">
      @foreach($menuNav->items ?? [] as $navItem)
        @if($navItem->inFooter)
          <li class="list-inline-item mx-3">
            <a
              class="text-white"
              href="{{ $navItem->getPath() }}"
              @if($navItem->external)
                target="_blank"
                rel="noopener noreferrer"
              @endif
            >
              <span class="visually-hidden">{{ $navItem->text }}</span>
              <i class="bi bi-{{ $navItem->icon }} h2"></i>
            </a>
          </li>
        @endif
      @endforeach
      <li class="list-inline-item mx-3">
        <a class="text-white" href="#" role="button">
          <span class="visually-hidden">Back to top</span>
          <i class="bi bi-arrow-up h2"></i>
        </a>
      </li>
    </ul>
  </nav>
  <p>
    Copyright &copy; {{ date('Y') }} by
    <a href="{{ route('about') }}" class="text-decoration-none text-white">
      Ramsey El-Naggar</a>.
  </p>
</footer>
