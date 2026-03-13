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
    <th>Source</th>
    <td>
      <x-inline-edit-text name="source" :action="route('portal.students.update', $student)" :value="$student->source" maxlength="255" required :datalist="$sources">
        {{ $student->source ?: '-' }}
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

<x-lesson-table
  :lessons="$lessons"
  :filterAction="route('portal.students.show', $student)"
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
