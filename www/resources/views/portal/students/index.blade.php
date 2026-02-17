@extends('layouts.app')

@section('title', 'Students')
@section('heading', 'Students')

@section('content')
<table class="table table-striped">
  <thead>
    <tr>
      <th>ID</th>
      <th>Name</th>
    </tr>
  </thead>
  <tbody>
    @forelse($students as $student)
      <tr>
        <td><a href="{{ route('portal.students.show', $student) }}">{{ $student->id }}</a></td>
        <td>{{ $student->name }}</td>
      </tr>
    @empty
      <tr>
        <td colspan="2" class="text-center">No students found.</td>
      </tr>
    @endforelse
  </tbody>
</table>
@endsection
