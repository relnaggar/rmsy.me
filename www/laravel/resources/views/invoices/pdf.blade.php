<!DOCTYPE html>
<html>
  <head>
    <title>{{ $invoice['number'] }}</title>
    <link rel="stylesheet" href="{{ $cssPath }}">
  </head>
  <body>
    <header>
      <h1>Ramsey El-Naggar</h1>
    </header>

    <hr>

    <main>
      <div class="left-column">
        <h4>Factura de:</h4>
        @foreach ($sellerAddress as $line)
          <div>{{ $line }}</div>
        @endforeach
      </div>

      <div class="right-column">
        <h4>Factura a:</h4>
        @foreach ($buyerAddress as $line)
          <div>{{ $line }}</div>
        @endforeach
      </div>

      <hr>

      <div class="left-column">
        <h4>Número de factura:</h4>
        <div>{{ $invoice['number'] }}</div>
      </div>

      <div class="right-column">
        <h4>Fecha de expedición:</h4>
        <div>{{ $invoice['issue_date'] }}</div>
        <h4>Fecha de vencimiento:</h4>
        <div>Pagado</div>
      </div>

      <hr>

      <table>
        <thead>
          <tr>
            <th class="text-start">Fecha</th>
            <th class="text-start">Descripción de servicio</th>
            <th class="text-end">Cantidad</th>
            <th class="text-end">Precio unitario</th>
            <th class="text-end">Importe</th>
          </tr>
        </thead>
        <tbody>
        @php $totalGbp = 0; @endphp
        @foreach ($items as $i => $item)
          @php
            $lineTotal = $item['qty'] * $item['unit_price'];
            $totalGbp += $lineTotal;
          @endphp
          <tr class="{{ $i % 2 === 0 ? 'bg-body-secondary' : '' }}">
            <td class="text-start">{{ $item['date'] }}</td>
            @if (isset($item['student']) && isset($item['client']))
              <td class="text-start">
                <div>{{ $item['service'] }}</div>
                <div>Estudiante: {{ $item['student'] }}</div>
                <div>Cliente: {{ $item['client'] }}</div>
              </td>
            @else
              <td class="text-start">{{ $item['service'] }}</td>
            @endif
            <td class="text-end">{{ (int) $item['qty'] }}</td>
            <td class="text-end">{{ formatCurrency($item['unit_price'], 'GBP') }}</td>
            <td class="text-end">{{ formatCurrency($lineTotal, 'GBP') }}</td>
          </tr>
        @endforeach
        </tbody>
      </table>

      <hr>

      <aside class="left-column">
        <h4>Notas:</h4>
        <div>{{ $invoice['notes'] }}</div>
      </aside>

      <table class="right-column">
        <tr>
          <td class="text-primary">Base imponible en GBP</td>
          <td class="text-end">{{ formatCurrency($totalGbp, 'GBP') }}</td>
        </tr>
        <tr>
          <td class="text-primary">Base imponible en EUR</td>
          <td class="text-end">
            {{ formatCurrency(
              (int) ceil($totalGbp / ($invoice['exchange_rate'] / 100000)),
              'EUR',
            ) }}
          </td>
        </tr>
        <tr>
          <td class="text-primary">IVA (Tipo de IVA 0%)</td>
          <td class="text-end">{{ formatCurrency(0, 'EUR') }}</td>
        </tr>
        <tr class="fw-bold">
          <td class="text-primary pb-3">Importe total</td>
          <td class="text-end pb-3">{{ formatCurrency($totalGbp, 'GBP') }}</td>
        </tr>
        <tr>
          <td class="text-primary">Importe pagado</td>
          <td class="text-end">{{ formatCurrency($totalGbp, 'GBP') }}</td>
        </tr>
        <tr class="fw-bold">
          <td class="text-primary pb-3">Importe a pagar</td>
          <td class="text-end pb-3">{{ formatCurrency(0, 'GBP') }}</td>
        </tr>
        <tr>
          <td>Tipo de cambio (GBP/EUR)</td>
          <td class="text-end">{{ $invoice['exchange_rate'] / 100000 }}</td>
        </tr>
      </table>
    </main>
  </body>
</html>
