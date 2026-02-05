@props(['type' => 'info', 'title' => null, 'message' => null, 'dismissible' => true])

<div class="alert alert-{{ $type }} {{ $dismissible ? 'alert-dismissible fade show' : '' }}" role="alert">
    @if($title)
        <strong>{{ $title }}</strong>
    @endif
    @if($message)
        {{ $message }}
    @endif
    {{ $slot }}
    @if($dismissible)
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    @endif
</div>
