@extends('layouts.app')

@section('title', 'Dashboard')
@section('heading', 'Dashboard')

@section('content')
<p>You're logged in as <strong>{{ $userEmail }}</strong>.</p>

@if($wiseDepositCount > 0)
  <div class="alert alert-info d-flex align-items-center justify-content-between">
    <span>
      <strong>{{ $wiseDepositCount }}</strong> new Wise {{ Str::plural('deposit', $wiseDepositCount) }} received.
      <a href="{{ route('portal.payments.index') }}">Import payments</a> to process.
    </span>
    <form action="{{ route('portal.wiseDeposits.destroy') }}" method="POST"
          data-confirm="Are you sure you want to clear all Wise deposits?">
      @csrf
      @method('DELETE')
      <button type="submit" class="btn btn-sm btn-outline-secondary ms-3">Clear</button>
    </form>
  </div>
@endif

@if($unmatchedPayments->isNotEmpty() || $pendingPayments->isNotEmpty())
  <h2 class="mt-4">Unmatched Payments</h2>
  @if($unmatchedPayments->isNotEmpty())
    <div class="mb-3">
      <a href="{{ route('portal.payments.matchNext') }}" class="btn btn-warning">
        Match Payments ({{ $unmatchedPayments->count() }} unmatched)
      </a>
    </div>
  @endif
  <x-payment-table :payments="$unmatchedPayments->concat($pendingPayments)" />
@endif

@if($buyersWithUnpaidLessons->isNotEmpty())
  <h2 class="mt-4">Pending Payments</h2>
  <table class="table table-striped">
    <thead>
      <tr>
        <th>Buyer</th>
        <th>Unpaid Complete Lessons</th>
        <th>Total Due (GBP)</th>
      </tr>
    </thead>
    <tbody>
      @foreach($buyersWithUnpaidLessons as $buyer)
        <tr @class(['table-warning' => $buyer->unpaid_lesson_count >= 2 && !$buyer->auto_pay])>
          <td><a href="{{ route('portal.buyers.show', $buyer) }}">{{ $buyer->name }}</a></td>
          <td>{{ $buyer->unpaid_lesson_count }}</td>
          <td>{{ penceToPounds($buyer->unpaid_total_pence) }}</td>
        </tr>
      @endforeach
    </tbody>
    <tfoot>
      <tr>
        <th>Total</th>
        <th>{{ $buyersWithUnpaidLessons->sum('unpaid_lesson_count') }}</th>
        <th>{{ penceToPounds($buyersWithUnpaidLessons->sum('unpaid_total_pence')) }}</th>
      </tr>
    </tfoot>
  </table>
@endif
@endsection
