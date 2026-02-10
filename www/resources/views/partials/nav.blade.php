@if(isset($menuNav))
<nav class="
  navbar
  navbar-expand-xl
  sticky-top
  navbar-dark
  bg-dark
  navbar-horizontal
">
  <a
    class="navbar-brand-custom navbar-brand-right-banner"
    href="{{ $menuNav->homePath }}"
  >
    {{ $menuNav->title }}
  </a>
  <button
    class="navbar-toggler-custom"
    type="button"
    data-bs-toggle="collapse"
    data-bs-target="#navbar"
    aria-controls="navbar"
    aria-expanded="false"
    aria-label="Toggle navigation"
  >
    <span class="navbar-toggler-icon"></span>
  </button>
  <div class="collapse navbar-collapse" id="navbar">
    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
      @foreach($menuNav->items as $navKey => $navItem)
        @if($navItem->inMenu && empty($navItem->alignEnd))
          <li class="nav-item {{ $navItem->isDropdown() ? 'dropdown' : '' }}">
            @if($navItem->isDropdown())
              <a
                class="nav-link dropdown-toggle {{ $navItem->isActive() ? 'active' : '' }}"
                href="#"
                id="dropdown{{ $navKey }}"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                @if($navItem->isActive()) aria-current="location" @endif
              >
                {{ $navItem->text }}
              </a>
              <ul
                class="dropdown-menu dropdown-menu-dark"
                aria-labelledby="dropdown{{ $navKey }}"
              >
                @foreach($navItem->getDropdownItems() as $dropdownItem)
                  <li>
                    <a
                      class="dropdown-item {{ $dropdownItem->isActive() ? 'active' : '' }}"
                      href="{{ $dropdownItem->getPath() }}"
                      @if($dropdownItem->isActive()) aria-current="page" @endif
                      @if($dropdownItem->external) target="_blank" rel="noopener noreferrer" @endif
                    >
                      {{ $dropdownItem->text }}
                      @if($dropdownItem->external)
                        <i class="bi bi-box-arrow-up-right"></i>
                      @endif
                    </a>
                  </li>
                @endforeach
              </ul>
            @else
              <a
                class="nav-link {{ $navItem->isActive() ? 'active' : '' }}"
                href="{{ $navItem->getPath() }}"
                @if($navItem->isActive()) aria-current="page" @endif
                @if($navItem->external) target="_blank" rel="noopener noreferrer" @endif
              >
                {{ $navItem->text }}
                @if($navItem->external)
                  <i class="bi bi-box-arrow-up-right"></i>
                @endif
              </a>
            @endif
          </li>
        @endif
      @endforeach
    </ul>

    <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
      @foreach($menuNav->items as $navKey => $navItem)
        @if($navItem->inMenu && !empty($navItem->alignEnd))
          <li class="nav-item {{ $navItem->isDropdown() ? 'dropdown' : '' }}">
            @if($navItem->isDropdown())
              <a
                class="nav-link dropdown-toggle {{ $navItem->isActive() ? 'active' : '' }}"
                href="#"
                id="dropdownEnd{{ $navKey }}"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                @if($navItem->isActive()) aria-current="location" @endif
              >
                {{ $navItem->text }}
              </a>
              <ul
                class="dropdown-menu dropdown-menu-dark"
                aria-labelledby="dropdownEnd{{ $navKey }}"
              >
                @foreach($navItem->getDropdownItems() as $dropdownItem)
                  <li>
                    <a
                      class="dropdown-item {{ $dropdownItem->isActive() ? 'active' : '' }}"
                      href="{{ $dropdownItem->getPath() }}"
                      @if($dropdownItem->isActive()) aria-current="page" @endif
                      @if($dropdownItem->external) target="_blank" rel="noopener noreferrer" @endif
                    >
                      {{ $dropdownItem->text }}
                      @if($dropdownItem->external)
                        <i class="bi bi-box-arrow-up-right"></i>
                      @endif
                    </a>
                  </li>
                @endforeach
              </ul>
            @else
              <a
                class="nav-link {{ $navItem->isActive() ? 'active' : '' }}"
                href="{{ $navItem->getPath() }}"
                @if($navItem->isActive()) aria-current="page" @endif
                @if($navItem->external) target="_blank" rel="noopener noreferrer" @endif
              >
                {{ $navItem->text }}
                @if($navItem->external)
                  <i class="bi bi-box-arrow-up-right"></i>
                @endif
              </a>
            @endif
          </li>
        @endif
      @endforeach
    </ul>
  </div>
</nav>
@endif
