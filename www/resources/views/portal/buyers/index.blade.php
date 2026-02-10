@extends('layouts.app')

@section('title', 'Buyers')
@section('heading', 'Buyers')

@section('content')
<table class="table table-striped">
  <thead>
    <tr>
      <th>ID</th>
      <th>Name</th>
      <th>Country</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    @forelse($buyers as $buyer)
      <tr>
        <td>{{ $buyer->id }}</td>
        <td>{{ $buyer->name }}</td>
        <td>{{ $buyer->getCountryName() }}</td>
        <td>
          <a href="{{ route('portal.buyers.edit', $buyer) }}" class="btn btn-sm btn-primary">Edit</a>
        </td>
      </tr>
    @empty
      <tr>
        <td colspan="4" class="text-center">No buyers found.</td>
      </tr>
    @endforelse
  </tbody>
</table>

@if($buyers->count() > 0)
  <form action="{{ route('portal.buyers.clear') }}" method="POST" class="mt-3"
        onsubmit="return confirm('Are you sure you want to delete all buyers?')">
    @csrf
    @method('DELETE')
    <button type="submit" class="btn btn-danger">Delete All Buyers</button>
  </form>
@endif
@endsection
