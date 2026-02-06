@extends('layouts.app')

@push('preload')
@foreach(array_slice($featuredProjects, 0, 2) as $featuredProject)
<link
  rel="preload"
  href="{{ media('img/' . $featuredProject->thumbnail->href) }}"
  as="image"
  type="{{ $featuredProject->thumbnail->getMimeType() }}"
>
@endforeach
@endpush

@section('title', 'Home')
@section('heading', 'Ramsey El-Naggar')
@section('subtitle', 'Software Engineer & Educator')
@section('metaDescription')
Hi, I'm Ramsey 👋. Welcome to my slice of the internet pie!
@endsection

@section('content')
<p class="lead">
  Hi, I'm Ramsey 👋. Welcome to my slice of the internet pie!
</p>

<p>
  Pull up a chair and dive into my digital saga, featuring:
</p>

<ul>
  <li>
    Five transformative years at the <strong>University of Edinburgh</strong>,
    resulting in a Master of Informatics
    (Computer Science & Intelligent Robotics) with First Class Honours
    and a newfound appreciation for the sanctity of sleep.
  </li>
  <li>
    A thrilling experience as a
    <strong>full stack developer</strong> interning at a leading IT
    service management provider: I laughed, I cried, I debugged.
    It was there that I sharpened my skills and grew a thick skin for
    real-world coding dramas.
  </li>
  <li>
    {{ $numberOfYearsTutoringAsWord }} years educating the world
    in computer science and software engineering, during which I earned the
    title of the UK's <strong>top 'Computing University' tutor</strong> on a
    leading platform.
    (No undergrads were harmed in the making of this story.)
  </li>
</ul>

<div class="row">
  @foreach($roles as $role)
    <div class="col-sm">
      <div class="card mb-3">
        <div class="card-header pt-3">
          <div class="h5">
            {{ $role['header'] }}
            <i class="bi bi-{{ $role['icon'] }}"></i>
          </div>
        </div>
        <div class="card-body">
          <p>
            {!! $role['content'] !!}
          </p>
          <p>
            @foreach ($role['callsToAction'] as $cta)
              @php
                $cta['class'] = 'btn btn-' . $cta['btn-type'] . ' mb-2';
              @endphp
              @if (!empty($cta['external']))
                <x-external-link
                  href="{{ $cta['href'] }}"
                  class="{{ $cta['class'] }}"
                >
                  {{ $cta['text'] }}
                </x-external-link>
              @else
                <a
                  href="{{ $cta['href'] }}"
                  class="{{ $cta['class'] }}"
                >
                  {{ $cta['text'] }}
                </a>
              @endif
            @endforeach
          </p>
        </div>
      </div>
    </div>
  @endforeach
</div>

<hr>

<h2 class="text-center mt-4 mb-3">Featured Projects</h2>

<p class="text-center mb-4">
  Here are some of the projects I've worked on. Click on a project to learn more.
</p>

<div class="row">
  @foreach($featuredProjects as $project)
    <div class="col-sm-6 mb-3 d-flex">
      <a
        href="{{ $project->getPath() }}"
        class="text-reset text-decoration-none d-flex w-100"
      >
        <div class="card flex-column w-100">
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
</div>
@endsection
