@extends('layouts.app')

@section('title', 'Edit Student')
@section('heading', 'Edit Student')

@section('content')
<form method="POST" action="{{ route('portal.students.update', $student) }}">
  @csrf
  @method('PUT')

  <x-form-input name="id" label="ID" :value="$student->id" :readonly="true" />
  <x-form-input name="name" label="Name" :value="$student->name" :required="true" maxlength="255" />

  <button type="submit" class="btn btn-primary">Update Student</button>
  <a href="{{ route('portal.students.index') }}" class="btn btn-secondary">Cancel</a>
</form>
@endsection
