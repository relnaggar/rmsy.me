@extends('layouts.app')

@section('title', 'Lessons')
@section('heading', 'Lessons')

@section('content')
<h2 class="h5 mb-3">Import</h2>
<div class="mb-4">
  <form action="{{ route('portal.lessons.import') }}" method="POST" class="row g-2 align-items-end">
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
      <button type="submit" class="btn btn-primary">Import from Calendar</button>
    </div>
  </form>
</div>

<h2 class="h5 mb-3">List</h2>
<x-lesson-table
  :lessons="$lessons"
  :filterAction="route('portal.lessons.index')"
  :buyerOptions="$buyerOptions"
  :studentOptions="$studentOptions"
  :clientOptions="$clientOptions"
  :completeFilter="$completeFilter"
  :buyerFilter="$buyerFilter"
  :studentFilter="$studentFilter"
  :clientFilter="$clientFilter"
  :startDateFilter="$startDateFilter"
  :endDateFilter="$endDateFilter"
/>
@endsection
