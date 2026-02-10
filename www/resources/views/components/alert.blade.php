@props(['type' => 'info', 'title' => null, 'message' => null, 'dismissible' => false])

<div class="alert alert-{{ $type }} {{ $dismissible ? 'alert-dismissible fade show' : '' }}" role="alert">
    @if($title)
        <h4 class="alert-heading">{{ $title }}</h4>
    @endif
    @if($message)
        <p>{!! $message !!}</p>
    @endif
    {{ $slot }}
    @if($dismissible)
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    @endif
</div>
