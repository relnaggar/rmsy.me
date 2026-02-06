@if(isset($onThisPage) && count($onThisPage) > 0)
<nav
  class="
    navbar
    flex-column
    justify-content-start
    navbar-light
    bg-light
    d-lg-none
    d-block
    border
    m-3
    navbar-vertical
  "
  data-nosnippet
>
  <span class="navbar-brand nav-link text-muted ps-3 pt-3 border-bottom">
    On this page
  </span>
  <ul class="navbar-nav">
    @foreach ($sections as $section)
      <li class="nav-item">
        <a
          class="nav-link"
          href="#{{ $section->id }}"
        >
          {{ $section->title }}
        </a>
      </li>
      @if (!empty($section->subsections))
        <ul class="nav navbar-nav">
          @foreach ($section->subsections as $subsection)
            <li class="nav-item">
              <a
                class="nav-link ms-3"
                href="#{{ $section->id }}-{{ $subsection->id }}"
              >
                {{ $subsection->title }}
              </a>
            </li>
          @endforeach
        </ul>
      @endif
    @endforeach
  </ul>
</nav>
@endif
