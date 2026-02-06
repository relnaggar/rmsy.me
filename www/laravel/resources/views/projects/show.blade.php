@extends('layouts.app')

@if($preloadImage !== null)
@push('preload')
<link
  rel="preload"
  href="{{ media('img/' . $preloadImage->href) }}"
  as="image"
  type="{{ $preloadImage->getMimeType() }}"
>
@endpush
@endif

@section('title', $project->title)
@section('heading', $project->title)
@section('metaDescription', $project->metaDescription)

@section('sections')
@foreach($sections as $section)
  <section id="{{ $section->id }}" class="mb-3">
    <h2>{{ $section->title }}</h2>
    <hr>
    {!! $section->getHtmlContent() !!}
  </section>
@endforeach
@endsection
