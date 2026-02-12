@extends('layouts.app')

@section('title', 'Lessons')
@section('heading', 'Lessons')

@section('content')
<div class="mb-3">
  @if($calendarAuthorised)
    <form action="{{ route('portal.lessons.import') }}" method="POST" class="d-flex gap-2 align-items-end">
      @csrf
      <div>
        <label for="start_date" class="form-label mb-0">From</label>
        <input type="date" id="start_date" name="start_date" class="form-control" value="{{ now()->subDays(90)->format('Y-m-d') }}" required>
      </div>
      <div>
        <label for="end_date" class="form-label mb-0">To</label>
        <input type="date" id="end_date" name="end_date" class="form-control" value="{{ now()->format('Y-m-d') }}" required>
      </div>
      <button type="submit" class="btn btn-primary">Import from Calendar</button>
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
      <th>Actions</th>
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
        <td>
          <a href="{{ route('portal.lessons.edit', $lesson) }}" class="btn btn-sm btn-primary">Edit</a>
          <form action="{{ route('portal.lessons.destroy', $lesson) }}" method="POST" class="d-inline"
                onsubmit="return confirm('Are you sure you want to delete this lesson?')">
            @csrf
            @method('DELETE')
            <button type="submit" class="btn btn-sm btn-danger">Delete</button>
          </form>
        </td>
      </tr>
    @empty
      <tr>
        <td colspan="8" class="text-center">No lessons found.</td>
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
