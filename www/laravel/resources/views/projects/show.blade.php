@extends('layouts.app')

@section('title', $project->title)
@section('heading', $project->title)
@section('metaDescription', $project->metaDescription)

@section('content')
@if($project->sources)
  <div class="mb-4">
    @foreach($project->sources as $source)
      <a href="{{ $source->href }}" class="btn btn-outline-primary me-2" target="_blank" rel="noopener noreferrer">
        <i class="bi bi-{{ $source->icon }}"></i> {{ $source->title }}
      </a>
    @endforeach
  </div>
@endif
@endsection

@section('sections')
@foreach($sections as $section)
  <section id="{{ $section->id }}" class="mb-4">
    <h2>{{ $section->title }}</h2>
    <hr>
    {!! $section->getHtmlContent() !!}
  </section>
@endforeach
@endsection
