@extends('layouts.app')

@section('title', 'Edit Payment')
@section('heading', 'Edit Payment')

@section('content')
<table class="table table-bordered mb-4">
  <tr>
    <th>ID</th>
    <td>{{ $payment->id }}</td>
  </tr>
  <tr>
    <th>Date</th>
    <td>{{ $payment->datetime->format('Y-m-d') }}</td>
  </tr>
  <tr>
    <th>Amount</th>
    <td>&pound;{{ $payment->getFormattedAmount() }}</td>
  </tr>
  <tr>
    <th>Currency</th>
    <td>{{ $payment->currency }}</td>
  </tr>
  <tr>
    <th>Reference</th>
    <td>{{ $payment->payment_reference }}</td>
  </tr>
  <tr>
    <th>Payer</th>
    <td>{{ $payment->payer ?? '-' }}</td>
  </tr>
</table>

<form method="POST" action="{{ route('portal.payments.update', $payment) }}">
  @csrf
  @method('PUT')

  <x-form-input name="buyer_id" label="Buyer" type="select" :value="$payment->buyer_id" :options="$buyers" />

  <button type="submit" class="btn btn-primary">Update Payment</button>
  <a href="{{ route('portal.payments.index') }}" class="btn btn-secondary">Cancel</a>
</form>
@endsection
