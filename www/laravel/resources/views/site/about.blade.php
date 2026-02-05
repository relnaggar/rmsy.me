@extends('layouts.app')

@section('title', 'About')
@section('heading', 'About Me')
@section('metaDescription', 'Learn more about Ramsey El-Naggar, a software engineer and educator based in the UK.')

@section('content')
<div class="row">
  <div class="col-md-8">
    <p class="lead">
      I'm Ramsey El-Naggar, a software engineer and educator with a passion for
      building great software and helping others learn to code.
    </p>

    <section id="experience" class="mb-4">
      <h2>Experience</h2>
      <hr>
      <p>
        I have experience working as a full-stack developer, building web applications
        using modern technologies including PHP, Laravel, JavaScript, and more.
      </p>
    </section>

    <section id="tutoring" class="mb-4">
      <h2>Tutoring</h2>
      <hr>
      <p>
        I've been tutoring computer science and software engineering for many years,
        helping students at all levels understand complex concepts and build their skills.
      </p>
    </section>

    <section id="education" class="mb-4">
      <h2>Education</h2>
      <hr>
      <p>
        I hold a Master of Informatics (Computer Science & Intelligent Robotics)
        with First Class Honours from the University of Edinburgh.
      </p>
    </section>
  </div>
  <div class="col-md-4">
    <img
      src="{{ $mediaRoot }}/profile.jpg"
      alt="Ramsey El-Naggar"
      class="img-fluid rounded"
    >
  </div>
</div>

<p class="text-muted mt-4">
  <small>Last updated: {{ $lastModifiedDateFormatted }}</small>
</p>
@endsection
