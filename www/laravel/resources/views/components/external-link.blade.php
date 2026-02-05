@props(['href', 'class' => ''])

@php
$isButton = str_contains($class, 'btn');
@endphp
<a
    href="{{ $href }}"
    class="{{ $class }}"
    target="_blank"
    rel="noopener noreferrer"
>
    {!! $html !!}
    @if ($isButton)
        <i class="bi bi-box-arrow-up-right"></i>
    @endif
</a>
@if (!$isButton)
    <i class="bi bi-box-arrow-up-right"></i>
@endif
