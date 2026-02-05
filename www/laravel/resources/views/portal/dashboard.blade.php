@extends('layouts.app')

@section('title', 'Portal Dashboard')
@section('heading', 'Portal Dashboard')

@section('content')
<p>You're logged in as <strong>{{ $userEmail }}</strong>.</p>

<div class="row mt-4">
  <div class="col-md-4 mb-3">
    <div class="card">
      <div class="card-header">Payments</div>
      <div class="card-body">
        <a href="{{ route('portal.payments.index') }}" class="btn btn-primary">View Payments</a>
      </div>
    </div>
  </div>

  <div class="col-md-4 mb-3">
    <div class="card">
      <div class="card-header">Buyers</div>
      <div class="card-body">
        <a href="{{ route('portal.buyers.index') }}" class="btn btn-primary">View Buyers</a>
      </div>
    </div>
  </div>

  <div class="col-md-4 mb-3">
    <div class="card">
      <div class="card-header">Students</div>
      <div class="card-body">
        <a href="{{ route('portal.students.index') }}" class="btn btn-primary">View Students</a>
      </div>
    </div>
  </div>

  <div class="col-md-4 mb-3">
    <div class="card">
      <div class="card-header">Clients</div>
      <div class="card-body">
        <a href="{{ route('portal.clients.index') }}" class="btn btn-primary">View Clients</a>
      </div>
    </div>
  </div>

  <div class="col-md-4 mb-3">
    <div class="card">
      <div class="card-header">Lessons</div>
      <div class="card-body">
        <a href="{{ route('portal.lessons.index') }}" class="btn btn-primary">View Lessons</a>
      </div>
    </div>
  </div>

  <div class="col-md-4 mb-3">
    <div class="card">
      <div class="card-header">Calendar</div>
      <div class="card-body">
        <a href="{{ route('auth.microsoft') }}" class="btn btn-outline-primary">Connect Microsoft</a>
      </div>
    </div>
  </div>
</div>

<form action="{{ route('logout') }}" method="POST" class="mt-4">
  @csrf
  <button type="submit" class="btn btn-danger">Logout</button>
</form>
@endsection
