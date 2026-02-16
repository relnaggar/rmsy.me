@extends('layouts.app')

@section('title', 'Students')
@section('heading', 'Students')

@section('content')
<table class="table table-striped">
  <thead>
    <tr>
      <th>ID</th>
      <th>Name</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    @forelse($students as $student)
      <tr>
        <td>{{ $student->id }}</td>
        <td>{{ $student->name }}</td>
        <td>
          <a href="{{ route('portal.students.edit', $student) }}" class="btn btn-sm btn-primary">Edit</a>
          <form action="{{ route('portal.students.destroy', $student) }}" method="POST" class="d-inline"
                data-confirm="Are you sure you want to delete this student?">
            @csrf
            @method('DELETE')
            <button type="submit" class="btn btn-sm btn-danger">Delete</button>
          </form>
        </td>
      </tr>
    @empty
      <tr>
        <td colspan="3" class="text-center">No students found.</td>
      </tr>
    @endforelse
  </tbody>
</table>

@if($students->count() > 0)
  <form action="{{ route('portal.students.clear') }}" method="POST" class="mt-3"
        data-confirm="Are you sure you want to delete all students?">
    @csrf
    @method('DELETE')
    <button type="submit" class="btn btn-danger">Delete All Students</button>
  </form>
@endif
@endsection
