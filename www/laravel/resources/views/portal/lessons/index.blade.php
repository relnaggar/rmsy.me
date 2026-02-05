@extends('layouts.app')

@section('title', 'Lessons')
@section('heading', 'Lessons')

@section('content')
<div class="mb-3">
  <form action="{{ route('portal.lessons.import') }}" method="POST" class="d-inline">
    @csrf
    <button type="submit" class="btn btn-primary">Import from Calendar</button>
  </form>
</div>

<table class="table table-striped">
  <thead>
    <tr>
      <th>Date/Time</th>
      <th>Duration</th>
      <th>Student</th>
      <th>Client</th>
      <th>Price</th>
      <th>Paid</th>
    </tr>
  </thead>
  <tbody>
    @forelse($lessons as $lesson)
      <tr>
        <td>{{ $lesson->datetime->format('Y-m-d H:i') }}</td>
        <td>{{ $lesson->duration_minutes }} min</td>
        <td>{{ $lesson->student?->name ?? '-' }}</td>
        <td>{{ $lesson->client?->name ?? '-' }}</td>
        <td>&pound;{{ number_format($lesson->price_gbp_pence / 100, 2) }}</td>
        <td>{{ $lesson->paid ? 'Yes' : 'No' }}</td>
      </tr>
    @empty
      <tr>
        <td colspan="6" class="text-center">No lessons found.</td>
      </tr>
    @endforelse
  </tbody>
</table>

@if($lessons->count() > 0)
  <form action="{{ route('portal.lessons.clear') }}" method="POST" class="mt-3"
        onsubmit="return confirm('Are you sure you want to delete all lessons?')">
    @csrf
    @method('DELETE')
    <button type="submit" class="btn btn-danger">Delete All Lessons</button>
  </form>
@endif
@endsection
