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
@endsection
