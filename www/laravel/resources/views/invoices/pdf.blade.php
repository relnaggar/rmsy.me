<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice {{ $invoiceNumber }}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; }
    h1 { color: #6f42c1; }
    .header { margin-bottom: 30px; }
    .left-column { float: left; width: 50%; }
    .right-column { float: right; width: 50%; text-align: right; }
    .clear { clear: both; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { color: #6f42c1; }
    .total { font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h1>INVOICE</h1>
    <div class="left-column">
      <h4>From:</h4>
      <p>{!! nl2br(e($sellerAddress)) !!}</p>
    </div>
    <div class="right-column">
      <h4>To:</h4>
      @if($payment->buyer)
        <p>
          {{ $payment->buyer->name }}<br>
          @if($payment->buyer->address1){{ $payment->buyer->address1 }}<br>@endif
          @if($payment->buyer->address2){{ $payment->buyer->address2 }}<br>@endif
          @if($payment->buyer->town_city){{ $payment->buyer->town_city }}<br>@endif
          @if($payment->buyer->zip_postal_code){{ $payment->buyer->zip_postal_code }}<br>@endif
          {{ $payment->buyer->getCountryName() }}
        </p>
      @endif
    </div>
    <div class="clear"></div>
  </div>

  <hr>

  <p><strong>Invoice Number:</strong> {{ $invoiceNumber }}</p>
  <p><strong>Invoice Date:</strong> {{ $payment->datetime->format('d F Y') }}</p>
  <p><strong>Payment Reference:</strong> {{ $payment->payment_reference }}</p>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Quantity</th>
        <th>Unit Price</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Online tutoring services</td>
        <td>1</td>
        <td>&pound;{{ $payment->getFormattedAmount() }}</td>
        <td>&pound;{{ $payment->getFormattedAmount() }}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr class="total">
        <td colspan="3">Total (GBP)</td>
        <td>&pound;{{ $payment->getFormattedAmount() }}</td>
      </tr>
      @if($exchangeRate)
        <tr>
          <td colspan="3">Total (EUR) @ {{ $exchangeRate }}</td>
          <td>&euro;{{ number_format(($payment->amount_gbp_pence / 100) * $exchangeRate, 2) }}</td>
        </tr>
      @endif
    </tfoot>
  </table>

  <p style="margin-top: 30px; font-size: 10px; color: #666;">
    Thank you for your business.
  </p>
</body>
</html>
