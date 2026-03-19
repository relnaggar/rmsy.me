@extends('layouts.app')

@section('title', 'Client')
@section('heading', 'Client')

@section('content')
<table class="table table-bordered mb-4">
  <col style="width: 1%">
  <tr>
    <th class="text-nowrap">ID</th>
    <td>{{ $client->id }}</td>
  </tr>
  <tr>
    <th>Name</th>
    <td>
      <x-inline-edit-text name="name" :action="route('portal.clients.update', $client)" :value="$client->name" maxlength="255" required>
        {{ $client->name }}
      </x-inline-edit-text>
    </td>
  </tr>
  <tr>
    <th>Actions</th>
    <td>
      <form action="{{ route('portal.clients.destroy', $client) }}" method="POST" class="d-inline"
            data-confirm="Are you sure you want to delete this client?">
        @csrf
        @method('DELETE')
        <button type="submit" class="btn btn-danger btn-sm">Delete Client</button>
      </form>
    </td>
  </tr>
</table>

<h2>Lessons</h2>

<x-lesson-table
  :lessons="$lessons"
  :filterAction="route('portal.clients.show', $client)"
  :buyerOptions="$buyerOptions"
  :studentOptions="$studentOptions"
  :clientOptions="$clientOptions"
  :completeFilter="$completeFilter"
  :paidFilter="$paidFilter"
  :buyerFilter="$buyerFilter"
  :studentFilter="$studentFilter"
  :clientFilter="$clientFilter"
  :startDateFilter="$startDateFilter"
  :endDateFilter="$endDateFilter"
/>
@endsection
