@props(['lesson'])

@php($payment = $lesson->payments->first())
@if($lesson->paid && $payment)
  <a href="{{ route('portal.payments.show', $payment) }}">Yes</a>
@else
  {{ $lesson->paid ? 'Yes' : 'No' }}
@endif
