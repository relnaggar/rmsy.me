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
</table>

<form method="POST" action="{{ route('portal.lessons.update', $lesson) }}">
  @csrf
  @method('PUT')

  <x-form-input name="price_gbp" label="Price (£)" :value="penceToPounds($lesson->price_gbp_pence)" required />
  <x-form-input name="buyer_id" label="Buyer" type="select" :value="$lesson->buyer_id" :options="$buyers" />

  <button type="submit" class="btn btn-primary">Update Lesson</button>
  @if($lesson->student)
    <button type="submit" name="apply_to_student" value="1" class="btn btn-outline-primary">Update All for {{ $lesson->student->name }}</button>
  @endif
  <a href="{{ route('portal.lessons.index') }}" class="btn btn-secondary">Cancel</a>
</form>
@endsection
