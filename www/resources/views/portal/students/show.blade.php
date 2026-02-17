@extends('layouts.app')

@section('title', 'Student')
@section('heading', 'Student')

@section('content')
<table class="table table-bordered mb-4">
  <col style="width: 1%">
  <tr>
    <th class="text-nowrap">ID</th>
    <td>{{ $student->id }}</td>
  </tr>
  <tr>
    <th>Name</th>
    <td>
      <x-inline-edit-text name="name" :action="route('portal.students.update', $student)" :value="$student->name" maxlength="255" required>
        {{ $student->name }}
      </x-inline-edit-text>
    </td>
  </tr>
  <tr>
    <th>Actions</th>
    <td>
      <form action="{{ route('portal.students.destroy', $student) }}" method="POST" class="d-inline"
            data-confirm="Are you sure you want to delete this student?">
        @csrf
        @method('DELETE')
        <button type="submit" class="btn btn-danger btn-sm">Delete Student</button>
      </form>
    </td>
  </tr>
</table>

<h2>Lessons</h2>

<table class="table table-striped">
  <thead>
    <tr>
      <th>Date</th>
      <th>Client</th>
      <th>Buyer</th>
      <th>Duration</th>
      <th>Price</th>
      <th>Paid</th>
    </tr>
  </thead>
  <tbody>
    @forelse($student->lessons as $lesson)
      <tr>
        <td><a href="{{ route('portal.lessons.show', $lesson) }}">{{ $lesson->getFormattedDatetime() }}</a></td>
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
        <td>{{ $lesson->duration_minutes }} min</td>
        <td>&pound;{{ $lesson->getFormattedPrice() }}</td>
        <td><x-paid-status :lesson="$lesson" /></td>
      </tr>
    @empty
      <tr>
        <td colspan="6" class="text-center">No lessons found for this student.</td>
      </tr>
    @endforelse
  </tbody>
</table>
@endsection
