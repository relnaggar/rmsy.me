@extends('layouts.app')

@section('title', 'Payments')
@section('heading', 'Payments')

@section('content')
<div class="mb-4">
  <form action="{{ route('portal.payments.import') }}" method="POST" enctype="multipart/form-data" class="row g-3 align-items-end">
    @csrf
    <div class="col-auto">
      <label for="csv_file" class="form-label">Import CSV</label>
      <input type="file" class="form-control" id="csv_file" name="csv_file" accept=".csv" required>
    </div>
    <div class="col-auto">
      <button type="submit" class="btn btn-primary">Import</button>
    </div>
  </form>
</div>

<table class="table table-striped">
  <thead>
    <tr>
      <th>ID</th>
      <th>Date</th>
      <th>Amount</th>
      <th>Currency</th>
      <th>Reference</th>
      <th>Payer</th>
      <th>Buyer</th>
      <th>Invoice</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    @forelse($payments as $payment)
      <tr>
        <td>{{ $payment->id }}</td>
        <td>{{ $payment->datetime->format('Y-m-d') }}</td>
        <td>{{ $payment->getFormattedAmount() }}</td>
        <td>{{ $payment->currency }}</td>
        <td>{{ Str::limit($payment->payment_reference, 30) }}</td>
        <td>{{ $payment->payer ?? '-' }}</td>
        <td>
          @if($payment->buyer)
            <a href="{{ route('portal.buyers.edit', $payment->buyer) }}">{{ $payment->buyer->name }}</a>
          @else
            -
          @endif
        </td>
        <td>
          @if($payment->getInvoiceNumber())
            <x-external-link :href="route('portal.invoices.show', $payment->getInvoiceNumber())">
              {{ $payment->getInvoiceNumber() }}
            </x-external-link>
          @else
            -
          @endif
        </td>
        <td>
          <a href="{{ route('portal.payments.show', $payment) }}" class="btn btn-sm {{ $payment->lessons_count > 0 ? 'btn-outline-secondary' : ($payment->lesson_pending ? 'btn-outline-info' : 'btn-warning') }}">
            {{ $payment->lessons_count > 0 ? 'Matched ('.$payment->lessons_count.')' : ($payment->lesson_pending ? 'Lesson Pending' : 'Unmatched') }}
          </a>
          <form action="{{ route('portal.payments.destroy', $payment) }}" method="POST" class="d-inline"
                data-confirm="Are you sure you want to delete this payment?">
            @csrf
            @method('DELETE')
            <button type="submit" class="btn btn-sm btn-danger">Delete</button>
          </form>
        </td>
      </tr>
    @empty
      <tr>
        <td colspan="9" class="text-center">No payments found.</td>
      </tr>
    @endforelse
  </tbody>
</table>

@if($payments->count() > 0)
  <form action="{{ route('portal.payments.clear') }}" method="POST" class="mt-3"
        data-confirm="Are you sure you want to delete all payments?">
    @csrf
    @method('DELETE')
    <button type="submit" class="btn btn-danger">Delete All Payments</button>
  </form>
@endif
@endsection
