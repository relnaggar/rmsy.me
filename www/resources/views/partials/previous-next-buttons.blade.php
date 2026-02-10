@if (!empty($sidebarNav) && $sidebarNav->isPreviousNextButtonsEnabled())
  @php
    $previousPath = $sidebarNav->getPreviousPath();
    $nextPath = $sidebarNav->getNextPath();
  @endphp
  <div class="text-center">
    <div class="btn-group">
      @if ($previousPath)
        <a href="{{ $previousPath }}" class="btn btn-primary">
          &#8592; Previous
        </a>
      @endif
      @if ($nextPath)
        <a href="{{ $nextPath }}" class="btn btn-primary">
          Next &#8594;
        </a>
      @endif
    </div>
  </div>
@endif
