@extends('layouts.app')

@section('title', 'Buyers')
@section('heading', 'Buyers')

@section('content')
<div class="mb-3">
  <a href="{{ route('portal.buyers.create') }}" class="btn btn-primary">Add Buyer</a>
</div>

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
          <form action="{{ route('portal.buyers.destroy', $buyer) }}" method="POST" class="d-inline"
                onsubmit="return confirm('Are you sure you want to delete this buyer?')">
            @csrf
            @method('DELETE')
            <button type="submit" class="btn btn-sm btn-danger">Delete</button>
          </form>
        </td>
      </tr>
    @empty
      <tr>
        <td colspan="4" class="text-center">No buyers found.</td>
      </tr>
    @endforelse
  </tbody>
</table>

@if($buyers->count() > 1)
  <div class="card mt-3">
    <div class="card-body">
      <h5 class="card-title">Reassign Lessons Between Buyers</h5>
      <form action="{{ route('portal.buyers.reassign') }}" method="POST"
            onsubmit="return confirm('Are you sure you want to reassign all lessons from the selected buyer to the other?')">
        @csrf
        <div class="row g-3 align-items-end">
          <div class="col-auto">
            <x-form-input name="from_buyer_id" label="From Buyer" type="select" :options="$buyerOptions" required />
          </div>
          <div class="col-auto">
            <x-form-input name="to_buyer_id" label="To Buyer" type="select" :options="$buyerOptions" required />
          </div>
          <div class="col-auto">
            <button type="submit" class="btn btn-warning">Reassign All Lessons</button>
          </div>
        </div>
      </form>
    </div>
  </div>
@endif

@if($buyers->count() > 0)
  <form action="{{ route('portal.buyers.clear') }}" method="POST" class="mt-3"
        onsubmit="return confirm('Are you sure you want to delete all buyers?')">
    @csrf
    @method('DELETE')
    <button type="submit" class="btn btn-danger">Delete All Buyers</button>
  </form>
@endif
@endsection
