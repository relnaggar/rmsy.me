@extends('layouts.app')

@section('title', 'Invoices')
@section('heading', 'Invoices')

@section('content')
@forelse($years as $year => $data)
  <h2 class="mt-4">{{ $year }}</h2>
  <table class="table table-striped">
    <thead>
      <tr>
        <th>Trimestre</th>
        <th class="text-end">GBP</th>
        <th class="text-end">EUR</th>
      </tr>
    </thead>
    <tbody>
      @for($t = 1; $t <= 4; $t++)
        @if(isset($data['trimestres'][$t]))
          <tr>
            <td>T{{ $t }}</td>
            <td class="text-end">{{ penceToPounds($data['trimestres'][$t]['total_gbp_pence']) }}</td>
            <td class="text-end">{{ penceToPounds($data['trimestres'][$t]['total_eur_cents']) }}</td>
          </tr>
        @endif
      @endfor
    </tbody>
    <tfoot>
      <tr class="fw-bold">
        <td>Total</td>
        <td class="text-end">{{ penceToPounds($data['total_gbp_pence']) }}</td>
        <td class="text-end">{{ penceToPounds($data['total_eur_cents']) }}</td>
      </tr>
    </tfoot>
  </table>
@empty
  <p class="mt-3">No invoices found.</p>
@endforelse

@if($invoices->isNotEmpty())
  <h2 class="mt-4">All Invoices</h2>
  <table class="table table-striped">
    <thead>
      <tr>
        <th>Invoice</th>
        <th>Issue Date</th>
        <th>Buyer</th>
        <th>Payment</th>
        <th class="text-end">GBP</th>
        <th class="text-end">EUR</th>
        <th class="text-end">GBP/EUR</th>
      </tr>
    </thead>
    <tbody>
      @foreach($invoices as $invoice)
        <tr>
          <td><x-external-link href="{{ route('portal.invoices.show', $invoice['number']) }}">{{ $invoice['number'] }}</x-external-link></td>
          <td>{{ $invoice['issue_date'] }}</td>
          <td>
            @if($invoice['buyer'])
              <a href="{{ route('portal.buyers.show', $invoice['buyer']) }}">{{ $invoice['buyer']->name }}</a>
            @endif
          </td>
          <td><a href="{{ route('portal.payments.show', $invoice['payment_id']) }}">{{ $invoice['payment_id'] }}</a></td>
          <td class="text-end">{{ penceToPounds($invoice['gbp_pence']) }}</td>
          <td class="text-end">{{ penceToPounds($invoice['eur_cents']) }}</td>
          <td class="text-end">{{ $invoice['exchange_rate'] }}</td>
        </tr>
      @endforeach
    </tbody>
  </table>
@endif
@endsection
