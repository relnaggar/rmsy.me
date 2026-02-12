@extends('layouts.app')

@section('title', 'Dashboard')
@section('heading', 'Dashboard')

@section('content')
<p>You're logged in as <strong>{{ $userEmail }}</strong>.</p>

@if($unmatchedPaymentCount > 0)
  <div class="mt-3">
    <a href="{{ route('portal.payments.matchNext') }}" class="btn btn-warning">
      Match Payments ({{ $unmatchedPaymentCount }})
    </a>
  </div>
@endif
@endsection
