@extends('layouts.app')

@section('title', 'Edit Client')
@section('heading', 'Edit Client')

@section('content')
<form method="POST" action="{{ route('portal.clients.update', $client) }}">
  @csrf
  @method('PUT')

  <x-form-input name="id" label="ID" :value="$client->id" :readonly="true" />
  <x-form-input name="name" label="Name" :value="$client->name" :required="true" maxlength="255" />

  <button type="submit" class="btn btn-primary">Update Client</button>
  <a href="{{ route('portal.clients.index') }}" class="btn btn-secondary">Cancel</a>
</form>
@endsection
