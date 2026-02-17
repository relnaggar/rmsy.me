@extends('layouts.app')

@section('title', 'Dashboard')
@section('heading', 'Dashboard')

@section('content')
<p>You're logged in as <strong>{{ $userEmail }}</strong>.</p>

@if($unmatchedPaymentCount > 0 || $pendingPaymentCount > 0)
  <div class="mt-3">
    @if($unmatchedPaymentCount > 0)
      <a href="{{ route('portal.payments.matchNext') }}" class="btn btn-warning">
        Match Payments ({{ $unmatchedPaymentCount }} unmatched{{ $pendingPaymentCount > 0 ? ', '.$pendingPaymentCount.' pending' : '' }})
      </a>
    @else
      <span class="btn btn-outline-info disabled">
        {{ $pendingPaymentCount }} payment(s) pending lessons
      </span>
    @endif
  </div>
@endif

@if($buyersWithUnpaidLessons->isNotEmpty())
  <h2 class="mt-4">Unpaid Lessons by Buyer</h2>
  <table class="table table-striped">
    <thead>
      <tr>
        <th>Buyer</th>
        <th>Unpaid Lessons</th>
        <th>Total Due</th>
      </tr>
    </thead>
    <tbody>
      @foreach($buyersWithUnpaidLessons as $buyer)
        <tr>
          <td><a href="{{ route('portal.buyers.show', $buyer) }}">{{ $buyer->name }}</a></td>
          <td>{{ $buyer->unpaid_lesson_count }}</td>
          <td>&pound;{{ penceToPounds($buyer->unpaid_total_pence) }}</td>
        </tr>
      @endforeach
    </tbody>
  </table>
@endif
@endsection
