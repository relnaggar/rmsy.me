@extends('layouts.app')

@section('title', 'Lessons')
@section('heading', 'Lessons')

@section('content')
<div class="mb-3">
  <form action="{{ route('portal.lessons.deleteFiltered') }}" method="POST" class="row g-2 align-items-end">
    @csrf
    <div class="col-auto">
      <label for="start_date" class="form-label mb-0">From</label>
      <input type="date" id="start_date" name="start_date" class="form-control" value="{{ $defaultStartDate }}" required>
    </div>
    <div class="col-auto d-flex align-items-end">
      <button type="button" class="btn btn-sm btn-outline-secondary" title="Copy From date to To date" data-copy-date-from="start_date" data-copy-date-to="end_date">&rarr;</button>
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
      <button type="submit" formaction="{{ route('portal.lessons.import') }}" class="btn btn-primary">Import from Calendar</button>
      <button type="submit" class="btn btn-danger"
              data-confirm="Are you sure you want to delete lessons matching these filters?">Delete Lessons</button>
    </div>
  </form>
</div>

<table class="table table-striped">
  <thead>
    <tr>
      <th>ID</th>
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
        <td><a href="{{ route('portal.lessons.show', $lesson) }}">{{ $lesson->id }}</a></td>
        <td>{{ $lesson->getFormattedDatetime() }}-{{ $lesson->datetime->copy()->addMinutes($lesson->duration_minutes)->format('H:i') }}</td>
        <td>{{ $lesson->repeat_weeks }}</td>
        <td>
          @if($lesson->student)
            <a href="{{ route('portal.students.show', $lesson->student) }}">{{ $lesson->student->name }}</a>
          @else
            -
          @endif
        </td>
        <td>
          @if($lesson->client)
            <a href="{{ route('portal.clients.show', $lesson->client) }}">{{ $lesson->client->name }}</a>
          @else
            -
          @endif
        </td>
        <td>
          @if($lesson->buyer)
            <a href="{{ route('portal.buyers.show', $lesson->buyer) }}">{{ $lesson->buyer->name }}</a>
          @else
            -
          @endif
        </td>
        <td>&pound;{{ $lesson->getFormattedPrice() }}</td>
        <td><x-paid-status :lesson="$lesson" /></td>
      </tr>
    @empty
      <tr>
        <td colspan="8" class="text-center">No lessons found.</td>
      </tr>
    @endforelse
  </tbody>
</table>
@endsection
