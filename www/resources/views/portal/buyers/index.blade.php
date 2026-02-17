@extends('layouts.app')

@section('title', 'Buyers')
@section('heading', 'Buyers')

@section('content')
<div class="mb-3">
  <a href="{{ route('portal.buyers.create') }}" class="btn btn-primary">Add Buyer</a>
</div>

@if($buyers->count() > 1)
  <x-bulk-assign-card
    title="Reassign Lessons Between Buyers"
    :action="route('portal.buyers.reassign')"
    confirmMessage="Are you sure you want to reassign all lessons from the selected buyer to the other?"
    buttonLabel="Reassign All Lessons"
    :fields="[
      ['name' => 'from_buyer_id', 'label' => 'From Buyer', 'options' => $buyerOptions],
      ['name' => 'to_buyer_id', 'label' => 'To Buyer', 'options' => $buyerOptions],
    ]"
  />
@endif

@if($buyers->count() > 0 && count($studentOptions) > 0)
  <x-bulk-assign-card
    title="Assign Student's Lessons to Buyer"
    :action="route('portal.buyers.assign')"
    confirmMessage="Are you sure you want to assign all lessons for this student to the selected buyer?"
    buttonLabel="Assign Lessons"
    :hiddenFields="['filter_type' => 'student']"
    :fields="[
      ['name' => 'filter_id', 'label' => 'Student', 'options' => $studentOptions],
      ['name' => 'buyer_id', 'label' => 'To Buyer', 'options' => $buyerOptions],
    ]"
  />
@endif

@if($buyers->count() > 0 && count($clientOptions) > 0)
  <x-bulk-assign-card
    title="Assign Client's Lessons to Buyer"
    :action="route('portal.buyers.assign')"
    confirmMessage="Are you sure you want to assign all lessons for this client to the selected buyer?"
    buttonLabel="Assign Lessons"
    :hiddenFields="['filter_type' => 'client']"
    :fields="[
      ['name' => 'filter_id', 'label' => 'Client', 'options' => $clientOptions],
      ['name' => 'buyer_id', 'label' => 'To Buyer', 'options' => $buyerOptions],
    ]"
  />
@endif

@if($buyers->count() > 0 && count($payerOptions) > 0)
  <x-bulk-assign-card
    title="Assign Payer's Payments to Buyer"
    :action="route('portal.buyers.assignPayments')"
    confirmMessage="Are you sure you want to assign all payments from this payer to the selected buyer?"
    buttonLabel="Assign Payments"
    :fields="[
      ['name' => 'payer', 'label' => 'Payer', 'options' => $payerOptions],
      ['name' => 'buyer_id', 'label' => 'To Buyer', 'options' => $buyerOptions],
    ]"
  />
@endif

<table class="table table-striped">
  <thead>
    <tr>
      <th>ID</th>
      <th>Name</th>
      <th>Country</th>
    </tr>
  </thead>
  <tbody>
    @forelse($buyers as $buyer)
      <tr>
        <td><a href="{{ route('portal.buyers.show', $buyer) }}">{{ $buyer->id }}</a></td>
        <td>{{ $buyer->name }}</td>
        <td>{{ $buyer->getCountryName() }}</td>
      </tr>
    @empty
      <tr>
        <td colspan="3" class="text-center">No buyers found.</td>
      </tr>
    @endforelse
  </tbody>
</table>
@endsection
