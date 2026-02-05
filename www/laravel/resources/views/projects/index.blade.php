@extends('layouts.app')

@section('title', 'Projects')
@section('heading', 'Projects')
@section('metaDescription', 'Browse my portfolio of software engineering and research projects.')

@section('content')
<p class="lead">
  Here are some of the projects I've worked on over the years.
</p>

<div class="row">
  @foreach($projects as $project)
    <div class="col-md-6 mb-4">
      <a
        href="{{ $project->getPath() }}"
        class="text-reset text-decoration-none"
      >
        <div class="card h-100">
          <img
            class="card-img-top"
            src="{{ $mediaRoot }}/{{ $project->thumbnail->href }}"
            alt="{{ $project->title }}"
          >
          <div class="card-body">
            <h5 class="card-title">{{ $project->title }}</h5>
            <p class="card-text">{{ $project->thumbnailDescription }}</p>
          </div>
        </div>
      </a>
    </div>
  @endforeach
</div>
@endsection
