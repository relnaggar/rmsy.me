@extends('layouts.app')

@section('title', 'Lessons')
@section('heading', 'Lessons')

@section('content')
<div class="mb-3">
  @if($calendarAuthorised)
    <form action="{{ route('portal.lessons.import') }}" method="POST" class="d-inline">
      @csrf
      <button type="submit" class="btn btn-primary">Import Lessons from Calendar</button>
    </form>
  @else
    <a href="{{ route('auth.microsoft') }}" class="btn btn-primary">Authorise Calendar Access</a>
  @endif
</div>

<table class="table table-striped">
  <thead>
    <tr>
      <th>Date/Time</th>
      <th>Repeat (Weeks)</th>
      <th>Student</th>
      <th>Client</th>
      <th>Buyer</th>
      <th>Price</th>
      <th>Paid</th>
    </tr>
  </thead>
  <tbody>
    @forelse($lessons as $lesson)
      <tr>
        <td>{{ $lesson->datetime->format('l jS F Y H:i') }}-{{ $lesson->datetime->copy()->addMinutes($lesson->duration_minutes)->format('H:i') }}</td>
        <td>{{ $lesson->repeat_weeks }}</td>
        <td>
          @if($lesson->student)
            <a href="{{ route('portal.students.edit', $lesson->student) }}">{{ $lesson->student->name }}</a>
          @else
            -
          @endif
        </td>
        <td>
          @if($lesson->client)
            <a href="{{ route('portal.clients.edit', $lesson->client) }}">{{ $lesson->client->name }}</a>
          @else
            -
          @endif
        </td>
        <td>
          @if($lesson->buyer)
            <a href="{{ route('portal.buyers.edit', $lesson->buyer) }}">{{ $lesson->buyer->name }}</a>
          @else
            -
          @endif
        </td>
        <td>&pound;{{ number_format($lesson->price_gbp_pence / 100, 2) }}</td>
        <td>{{ $lesson->paid ? 'Yes' : 'No' }}</td>
      </tr>
    @empty
      <tr>
        <td colspan="7" class="text-center">No lessons found.</td>
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
