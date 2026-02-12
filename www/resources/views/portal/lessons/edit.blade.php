@extends('layouts.app')

@section('title', 'Edit Lesson')
@section('heading', 'Edit Lesson')

@section('content')
<table class="table table-bordered mb-4">
  <tr>
    <th>Date/Time</th>
    <td>{{ $lesson->datetime->format('l jS F Y H:i') }}-{{ $lesson->datetime->copy()->addMinutes($lesson->duration_minutes)->format('H:i') }}</td>
  </tr>
  <tr>
    <th>Student</th>
    <td>{{ $lesson->student?->name ?? '-' }}</td>
  </tr>
  <tr>
    <th>Client</th>
    <td>{{ $lesson->client?->name ?? '-' }}</td>
  </tr>
  <tr>
    <th>Price</th>
    <td>&pound;{{ number_format($lesson->price_gbp_pence / 100, 2) }}</td>
  </tr>
</table>

<form method="POST" action="{{ route('portal.lessons.update', $lesson) }}">
  @csrf
  @method('PUT')

  <x-form-input name="buyer_id" label="Buyer" type="select" :value="$lesson->buyer_id" :options="$buyers" />

  <button type="submit" class="btn btn-primary">Update Lesson</button>
  <a href="{{ route('portal.lessons.index') }}" class="btn btn-secondary">Cancel</a>
</form>
@endsection
