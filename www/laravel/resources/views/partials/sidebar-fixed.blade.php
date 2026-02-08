@if(isset($sidebarNav))
  <nav
    class="
      navbar
      flex-column
      navbar-light
      justify-content-start
      bg-light
      navbar-vertical
      sidebar
      flex-nowrap
    "
  >
    <span class="navbar-brand p-3 m-0">
      {{ $sidebarNav->title }}
    </span>
    <ul class="navbar-nav w-100">
      @foreach($sidebarNav->items as $sidebarNavItem)
        <li class="nav-item">
          @if($sidebarNavItem->method === 'POST')
            <form method="POST" action="{{ $sidebarNavItem->getPath() }}">
              @csrf
              <button
                type="submit"
                class="nav-link pe-3 border-0 bg-transparent w-100 text-start"
              >
                {{ $sidebarNavItem->text }}
              </button>
            </form>
          @else
            <a
              class="nav-link pe-3 {{ $sidebarNavItem->isActive() ? 'active' : '' }}"
              @if($sidebarNavItem->isActive()) aria-current="page" @endif
              href="{{ $sidebarNavItem->getPath() }}"
            >
              {{ $sidebarNavItem->text }}
            </a>
          @endif
        </li>
      @endforeach
    </ul>
    <div class="mb-5"></div>
  </nav>
@endif
