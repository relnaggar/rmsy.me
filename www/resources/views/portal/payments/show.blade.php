@extends('layouts.app')

@section('title', 'Payment')
@section('heading', 'Payment')

@section('content')
<table class="table table-bordered mb-4">
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

<form method="POST" action="{{ route('portal.payments.update', $payment) }}" class="mb-4">
  @csrf
  @method('PUT')

  <x-form-input name="buyer_id" label="Buyer" type="select" :value="$payment->buyer_id" :options="$buyers" />

  <button type="submit" class="btn btn-primary">Update Buyer</button>
</form>

<form method="POST" action="{{ route('portal.payments.toggleLessonPending', $payment) }}" class="mb-4">
  @csrf
  @if($payment->lesson_pending)
    <button type="submit" class="btn btn-warning">Remove Lesson Pending</button>
    <span class="ms-2 text-muted">This payment is marked as lesson pending and will be skipped during match-next.</span>
  @else
    <button type="submit" class="btn btn-outline-warning">Mark as Lesson Pending</button>
  @endif
</form>

@if($errors->any())
  <div class="alert alert-danger">
    @foreach($errors->all() as $error)
      <p class="mb-0">{{ $error }}</p>
    @endforeach
  </div>
@endif

@if($payment->buyer_id)
<h2>Lessons</h2>

<form action="{{ route('portal.payments.storeMatches', $payment) }}{{ $next ? '?next=1' : '' }}" method="POST" data-match-payment="{{ $payment->amount_gbp_pence }}">
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
            <input type="checkbox" name="lesson_ids[]" value="{{ $lesson->id }}" data-price="{{ $lesson->price_gbp_pence }}" {{ in_array($lesson->id, $matchedLessonIds) ? 'checked' : '' }} {{ in_array($lesson->id, $suggestedIds) ? 'data-suggested' : '' }}>
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
          <td>&pound;{{ $lesson->getFormattedPrice() }}</td>
        </tr>
      @empty
        <tr>
          <td colspan="6" class="text-center">No lessons found for this buyer.</td>
        </tr>
      @endforelse
    </tbody>
  </table>

  <div class="mt-3 d-flex align-items-center gap-3">
    <button type="submit" class="btn btn-primary">Confirm Matches</button>
    <span>Selected total: <strong id="match-total"></strong> / &pound;{{ $payment->getFormattedAmount() }}</span>
  </div>
</form>

@if($payment->lessons->count() > 0)
  <form action="{{ route('portal.payments.destroyMatches', $payment) }}" method="POST" class="mt-3"
        data-confirm="Are you sure you want to unmatch all lessons from this payment?">
    @csrf
    @method('DELETE')
    <button type="submit" class="btn btn-outline-danger">Unmatch All</button>
  </form>
@endif
@endif

@if($prevByBuyer || $nextByBuyer)
<nav class="d-flex justify-content-between mt-4">
  <div>
    @if($prevByBuyer)
      <a href="{{ route('portal.payments.show', $prevByBuyer) }}" class="btn btn-outline-primary">&larr; Prev ({{ $prevByBuyer->datetime->format('Y-m-d') }})</a>
    @endif
  </div>
  <div>
    @if($nextByBuyer)
      <a href="{{ route('portal.payments.show', $nextByBuyer) }}" class="btn btn-outline-primary">Next ({{ $nextByBuyer->datetime->format('Y-m-d') }}) &rarr;</a>
    @endif
  </div>
</nav>
@endif
@endsection
