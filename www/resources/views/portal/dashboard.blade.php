@extends('layouts.app')

@section('title', 'Dashboard')
@section('heading', 'Dashboard')

@section('content')
<p>You're logged in as <strong>{{ $userEmail }}</strong>.</p>

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
  <h2 class="mt-4">Unpaid Lessons</h2>
  <table class="table table-striped">
    <thead>
      <tr>
        <th>Buyer</th>
        <th>Unpaid Lessons</th>
        <th>Total Due (GBP)</th>
      </tr>
    </thead>
    <tbody>
      @foreach($buyersWithUnpaidLessons as $buyer)
        <tr>
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
