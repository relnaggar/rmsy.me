@extends('layouts.app')

@section('title', 'Students')
@section('heading', 'Students')

@section('content')
<table class="table table-striped">
  <thead>
    <tr>
      <th>ID</th>
      <th>Name</th>
      <th>Source</th>
    </tr>
  </thead>
  <tbody>
    @forelse($students as $student)
      <tr>
        <td><a href="{{ route('portal.students.show', $student) }}">{{ $student->id }}</a></td>
        <td>{{ $student->name }}</td>
        <td>{{ $student->source }}</td>
      </tr>
    @empty
      <tr>
        <td colspan="3" class="text-center">No students found.</td>
      </tr>
    @endforelse
  </tbody>
</table>
@endsection
