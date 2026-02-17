@extends('layouts.app')

@section('title', 'Payment')
@section('heading', 'Payment')

@section('content')
<table class="table table-bordered mb-4">
  <col style="width: 1%">
  <tr>
    <th class="text-nowrap">ID</th>
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
  <tr>
    <th>Buyer</th>
    <td>
      <x-inline-edit-select name="buyer_id" :action="route('portal.payments.update', $payment)" :value="$payment->buyer_id" :options="$buyers">
        @if($payment->buyer)
          <a href="{{ route('portal.buyers.show', $payment->buyer) }}">{{ $payment->buyer->name }}</a>
        @else
          <span class="text-muted">-</span>
        @endif
      </x-inline-edit-select>
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
  <tr>
    <th class="text-nowrap">Status</th>
    <td>
      @if($payment->isFullyMatched())
        <span class="badge bg-success">Matched</span>
      @elseif($payment->isPartiallyMatched() || $payment->lesson_pending)
        <span class="badge bg-warning text-dark">Lesson(s) Pending</span>
      @else
        <span class="badge bg-secondary">Unmatched</span>
      @endif
    </td>
  </tr>
  <tr>
    <th>Actions</th>
    <td class="d-flex align-items-center gap-2">
      <form action="{{ route('portal.payments.destroy', $payment) }}" method="POST" class="d-inline"
            data-confirm="Are you sure you want to delete this payment?">
        @csrf
        @method('DELETE')
        <button type="submit" class="btn btn-danger btn-sm">Delete Payment</button>
      </form>
      @if($payment->lessons->count() > 0)
        <form method="POST" action="{{ route('portal.payments.destroyMatches', $payment) }}" class="d-inline"
              data-confirm="Are you sure you want to unmatch all lessons from this payment?">
          @csrf
          @method('DELETE')
          <button type="submit" class="btn btn-outline-danger btn-sm">Unmatch All</button>
        </form>
      @else
        <form method="POST" action="{{ route('portal.payments.toggleLessonPending', $payment) }}" class="d-inline">
          @csrf
          @if($payment->lesson_pending)
            <button type="submit" class="btn btn-outline-warning btn-sm">Remove Lesson(s) Pending</button>
          @else
            <button type="submit" class="btn btn-outline-warning btn-sm">Mark Lesson(s) Pending</button>
          @endif
        </form>
      @endif
    </td>
  </tr>
</table>

@if($errors->any())
  <div class="alert alert-danger">
    @foreach($errors->all() as $error)
      <p class="mb-0">{{ $error }}</p>
    @endforeach
  </div>
@endif

@if($payment->buyer_id)
<h2>Lessons</h2>

@if($payment->lessons->count() > 0)
  <h5>Matched Lessons (&pound;{{ penceToPounds($payment->getMatchedTotal()) }} / &pound;{{ $payment->getFormattedAmount() }})</h5>
  <table class="table table-striped">
    <thead>
      <tr>
        <th>Date</th>
        <th>Student</th>
        <th>Client</th>
        <th>Duration</th>
        <th>Price</th>
      </tr>
    </thead>
    <tbody>
      @foreach($payment->lessons->sortBy('datetime') as $lesson)
        <tr>
          <td><a href="{{ route('portal.lessons.show', $lesson) }}">{{ $lesson->getFormattedDatetime() }}</a></td>
          <td>
            @if($lesson->student)
              <a href="{{ route('portal.students.show', $lesson->student) }}">{{ $lesson->student->name }}</a>
            @else
              -
            @endif
          </td>
          <td>
            @if($lesson->client)
              <a href="{{ route('portal.clients.show', $lesson->client) }}">{{ $lesson->client->name }}</a>
            @else
              -
            @endif
          </td>
          <td>{{ $lesson->duration_minutes }} min</td>
          <td>&pound;{{ $lesson->getFormattedPrice() }}</td>
        </tr>
      @endforeach
    </tbody>
  </table>
@endif

@if(!$payment->isFullyMatched())
  @if($payment->lessons->count() > 0)
    <h5>Match More Lessons (remaining: &pound;{{ penceToPounds($remainingAmount) }})</h5>
  @endif

  <form action="{{ route('portal.payments.storeMatches', $payment) }}{{ $next ? '?next=1' : '' }}" method="POST" data-match-payment="{{ $remainingAmount }}">
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
              <input type="checkbox" name="lesson_ids[]" value="{{ $lesson->id }}" data-price="{{ $lesson->price_gbp_pence }}" {{ in_array($lesson->id, $suggestedIds) ? 'data-suggested' : '' }}>
            </td>
            <td><a href="{{ route('portal.lessons.show', $lesson) }}">{{ $lesson->getFormattedDatetime() }}</a></td>
            <td>
              @if($lesson->student)
                <a href="{{ route('portal.students.show', $lesson->student) }}">{{ $lesson->student->name }}</a>
              @else
                -
              @endif
            </td>
            <td>
              @if($lesson->client)
                <a href="{{ route('portal.clients.show', $lesson->client) }}">{{ $lesson->client->name }}</a>
              @else
                -
              @endif
            </td>
            <td>{{ $lesson->duration_minutes }} min</td>
            <td>&pound;{{ $lesson->getFormattedPrice() }}</td>
          </tr>
        @empty
          <tr>
            <td colspan="6" class="text-center">No unmatched lessons found for this buyer.</td>
          </tr>
        @endforelse
      </tbody>
    </table>

    <div class="mt-3 d-flex align-items-center gap-3">
      <button type="submit" class="btn btn-primary">Confirm Matches</button>
      <span>Selected total: <strong id="match-total"></strong> / &pound;{{ penceToPounds($remainingAmount) }}</span>
    </div>
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
