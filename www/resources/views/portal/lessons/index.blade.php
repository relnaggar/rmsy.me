@extends('layouts.app')

@section('title', 'Lessons')
@section('heading', 'Lessons')

@section('content')
<div class="mb-3">
  <form action="{{ route('portal.lessons.deleteFiltered') }}" method="POST" class="row g-2 align-items-end">
    @csrf
    <div class="col-auto">
      <label for="start_date" class="form-label mb-0">From</label>
      <input type="date" id="start_date" name="start_date" class="form-control" value="{{ now()->subDays(90)->format('Y-m-d') }}" required>
    </div>
    <div class="col-auto">
      <label for="end_date" class="form-label mb-0">To</label>
      <input type="date" id="end_date" name="end_date" class="form-control" value="{{ now()->format('Y-m-d') }}" required>
    </div>
    <div class="col-auto">
      <label for="buyer_id" class="form-label mb-0">Buyer</label>
      <select id="buyer_id" name="buyer_id" class="form-select">
        @foreach($buyerOptions as $value => $label)
          <option value="{{ $value }}">{{ $label }}</option>
        @endforeach
      </select>
    </div>
    <div class="col-auto">
      <label for="student_id" class="form-label mb-0">Student</label>
      <select id="student_id" name="student_id" class="form-select">
        @foreach($studentOptions as $value => $label)
          <option value="{{ $value }}">{{ $label }}</option>
        @endforeach
      </select>
    </div>
    <div class="col-auto">
      <label for="client_id" class="form-label mb-0">Client</label>
      <select id="client_id" name="client_id" class="form-select">
        @foreach($clientOptions as $value => $label)
          <option value="{{ $value }}">{{ $label }}</option>
        @endforeach
      </select>
    </div>
    <div class="col-auto">
      @if($calendarAuthorised)
        <button type="submit" formaction="{{ route('portal.lessons.import') }}" class="btn btn-primary">Import from Calendar</button>
      @else
        <a href="{{ route('auth.microsoft') }}" class="btn btn-primary">Authorise Calendar Access</a>
      @endif
      <button type="submit" class="btn btn-danger"
              data-confirm="Are you sure you want to delete lessons matching these filters?">Delete Lessons</button>
    </div>
  </form>
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
                data-confirm="Are you sure you want to delete this lesson?">
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
        data-confirm="Are you sure you want to delete all lessons?">
    @csrf
    @method('DELETE')
    <button type="submit" class="btn btn-danger">Delete All Lessons</button>
  </form>
@endif
@endsection
