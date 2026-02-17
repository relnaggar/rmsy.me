@extends('layouts.app')

@section('title', 'Clients')
@section('heading', 'Clients')

@section('content')
<table class="table table-striped">
  <thead>
    <tr>
      <th>ID</th>
      <th>Name</th>
    </tr>
  </thead>
  <tbody>
    @forelse($clients as $client)
      <tr>
        <td><a href="{{ route('portal.clients.show', $client) }}">{{ $client->id }}</a></td>
        <td>{{ $client->name }}</td>
      </tr>
    @empty
      <tr>
        <td colspan="2" class="text-center">No clients found.</td>
      </tr>
    @endforelse
  </tbody>
</table>
@endsection
