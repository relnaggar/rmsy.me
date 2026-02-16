@extends('layouts.app')

@section('title', 'Match Lessons to Payment')
@section('heading', 'Match Lessons to Payment')

@section('content')
<div class="mb-4">
  <table class="table table-bordered">
    <tr>
      <th>Date</th>
      <td>{{ $payment->datetime->format('Y-m-d') }}</td>
    </tr>
    <tr>
      <th>Amount</th>
      <td>&pound;{{ $payment->getFormattedAmount() }}</td>
    </tr>
    <tr>
      <th>Payer</th>
      <td>{{ $payment->payer ?? '-' }}</td>
    </tr>
    <tr>
      <th>Buyer</th>
      <td>
        @if($payment->buyer)
          <a href="{{ route('portal.buyers.edit', $payment->buyer) }}">{{ $payment->buyer->name }}</a>
        @else
          -
        @endif
      </td>
    </tr>
    <tr>
      <th>Invoice</th>
      <td>
        @if($payment->getInvoiceNumber())
          <x-external-link :href="route('portal.invoices.show', $payment->getInvoiceNumber())">{{ $payment->getInvoiceNumber() }}</x-external-link>
        @else
          -
        @endif
      </td>
    </tr>
  </table>
</div>

<form action="{{ route('portal.payments.storeMatches', $payment) }}{{ $next ? '?next=1' : '' }}" method="POST">
  @csrf

  <table class="table table-striped">
    <thead>
      <tr>
        <th></th>
        <th>Date</th>
        <th>Student</th>
        <th>Client</th>
        <th>Duration</th>
        <th>Price</th>
      </tr>
    </thead>
    <tbody>
      @forelse($lessons as $lesson)
        <tr class="{{ in_array($lesson->id, $suggestedIds) ? 'table-info' : '' }}">
          <td>
            <input type="checkbox" name="lesson_ids[]" value="{{ $lesson->id }}" {{ in_array($lesson->id, $matchedLessonIds) ? 'checked' : '' }}>
          </td>
          <td><a href="{{ route('portal.lessons.edit', $lesson) }}">{{ $lesson->datetime->format('Y-m-d H:i') }}</a></td>
          <td>
            @if($lesson->student)
              <a href="{{ route('portal.students.edit', $lesson->student) }}">{{ $lesson->student->name }}</a>
            @else
              -
            @endif
          </td>
          <td>
            @if($lesson->client)
              <a href="{{ route('portal.clients.edit', $lesson->client) }}">{{ $lesson->client->name }}</a>
            @else
              -
            @endif
          </td>
          <td>{{ $lesson->duration_minutes }} min</td>
          <td>&pound;{{ number_format($lesson->price_gbp_pence / 100, 2) }}</td>
        </tr>
      @empty
        <tr>
          <td colspan="6" class="text-center">No lessons found for this buyer.</td>
        </tr>
      @endforelse
    </tbody>
  </table>

  <div class="mt-3">
    <button type="submit" class="btn btn-primary">Confirm Matches</button>
    <a href="{{ $next ? route('portal.dashboard') : route('portal.payments.index') }}" class="btn btn-secondary">Cancel</a>
  </div>
</form>
@endsection
