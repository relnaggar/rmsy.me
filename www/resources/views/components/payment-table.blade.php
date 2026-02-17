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
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    @forelse($payments as $payment)
      <tr>
        <td><a href="{{ route('portal.payments.show', $payment) }}">{{ $payment->id }}</a></td>
        <td>{{ $payment->datetime->format('Y-m-d') }}</td>
        <td>{{ $payment->getFormattedAmount() }}</td>
        <td>{{ $payment->currency }}</td>
        <td>{{ Str::limit($payment->payment_reference, 30) }}</td>
        <td>{{ $payment->payer ?? '-' }}</td>
        <td>
          @if($payment->buyer)
            <a href="{{ route('portal.buyers.show', $payment->buyer) }}">{{ $payment->buyer->name }}</a>
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
          @if($payment->lessons_count > 0 && !$payment->lesson_pending)
            <span class="badge bg-success">Matched ({{ $payment->lessons_count }})</span>
          @elseif($payment->lesson_pending)
            <span class="badge bg-warning text-dark">Lesson(s) Pending{{ $payment->lessons_count > 0 ? ' ('.$payment->lessons_count.')' : '' }}</span>
          @else
            <span class="badge bg-secondary">Unmatched</span>
          @endif
        </td>
      </tr>
    @empty
      <tr>
        <td colspan="9" class="text-center">No payments found.</td>
      </tr>
    @endforelse
  </tbody>
</table>
