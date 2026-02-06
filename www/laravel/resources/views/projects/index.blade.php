@extends('layouts.app')

@push('preload')
@foreach($preloadImages as $preloadImage)
<link
  rel="preload"
  href="{{ media('img/' . $preloadImage->href) }}"
  as="image"
  type="{{ $preloadImage->getMimeType() }}"
>
@endforeach
@endpush

@section('title', 'All Projects')
@section('heading', 'All Projects')
@section('metaDescription')
A collection of programming and robotics projects I've worked on over the years. Check out my work!
@endsection

@section('content')
<div class="row">
  @foreach($projects as $project)
    <div class="col-sm-6 mb-3 d-flex">
      <a
        href="{{ $project->getPath() }}"
        class="text-reset text-decoration-none d-flex"
      >
        <div class="card flex-column equal-height">
          <img
            class="card-img-top"
            src="{{ media('img/' . $project->thumbnail->href) }}"
            alt="{{ $project->title }}"
          >
          <div class="card-body">
            <div class="card-title h5">
              {{ $project->title }}
            </div>
            <p class="card-text">{{ $project->thumbnailDescription }}</p>
          </div>
        </div>
      </a>
    </div>
  @endforeach
  <div class="col-sm-6 mb-3 d-flex">
    <div class="card flex-column equal-height">
      <img
        class="card-img-top"
        src="{{ media('img/coming-soon.jpg') }}"
        alt="Coming Soon"
      >
      <div class="card-body">
      <div class="card-title h5">Top Secret</div>
        <p class="card-text">
          A project so secret, even my compiler doesn't know about it yet!
          Stay tuned for more details.
        </p>
      </div>
    </div>
  </div>
</div>
@endsection
