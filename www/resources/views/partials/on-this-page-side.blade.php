@if(isset($onThisPage) && count($onThisPage) > 0)
<nav
  id="sidebarMenu"
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
  <span class="border-bottom w-100 text-muted p-3">On this page</span>
  <ul class="navbar-nav w-100">
    @foreach($onThisPage as $section)
      <li class="nav-item">
        <a class="nav-link pe-3" href="#{{ $section->id }}">
          {{ $section->title }}
        </a>
      </li>
    @endforeach
  </ul>
  <div class="mb-5"></div>
</nav>
@endif
