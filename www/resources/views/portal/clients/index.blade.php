@extends('layouts.app')

@section('title', 'Clients')
@section('heading', 'Clients')

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
    @forelse($clients as $client)
      <tr>
        <td>{{ $client->id }}</td>
        <td>{{ $client->name }}</td>
        <td>
          <a href="{{ route('portal.clients.edit', $client) }}" class="btn btn-sm btn-primary">Edit</a>
          <form action="{{ route('portal.clients.destroy', $client) }}" method="POST" class="d-inline"
                data-confirm="Are you sure you want to delete this client?">
            @csrf
            @method('DELETE')
            <button type="submit" class="btn btn-sm btn-danger">Delete</button>
          </form>
        </td>
      </tr>
    @empty
      <tr>
        <td colspan="3" class="text-center">No clients found.</td>
      </tr>
    @endforelse
  </tbody>
</table>
@endsection
