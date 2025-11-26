<!DOCTYPE html>
<html>
  <head>
    <title><?= $invoice['number'] ?></title>
    <link rel="stylesheet" href="<?= $cssPath ?>">
  </head>
  <body>
    <header>
      <h1>Ramsey El-Naggar</h1>
    </header>

    <hr>

    <main>
      <div class="left-column">
        <h4>Factura de:</h4>
        <?php foreach ($sellerAddress as $line): ?>
          <div><?= htmlspecialchars($line) ?></div>
        <?php endforeach; ?>
      </div>

      <div class="right-column">
        <h4>Factura a:</h4>
        <?php foreach ($buyerAddress as $line): ?>
          <div><?= htmlspecialchars($line) ?></div>
        <?php endforeach; ?>
      </div>

      <hr>

      <div class="left-column">
        <h4>Número de factura:</h4>
        <div><?= $invoice['number'] ?></div>
      </div>

      <div class="right-column">
        <h4>Fecha de expedición:</h4>
        <div><?= $invoice['issue_date'] ?></div>
        <h4>Fecha de vencimiento:</h4>
        <div>Pagado</div>
      </div>

      <hr>

      <table class="w-100">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Descripción de servicio</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Importe</th>
          </tr>
        </thead>
        <tbody>
        <?php $total_gbp = 0; ?>
        <?php for ($i = 0; $i < count($items); $i++): ?>
          <?php
            $item = $items[$i];
            $line_total = $item['qty'] * $item['unit_price'];
            $total_gbp += $line_total;
          ?>
          <tr class="<?= $i % 2 === 0 ? 'bg-body-secondary' : '' ?>">
            <td><?= htmlspecialchars($item['date']) ?></td>
            <td>
              <div><?= htmlspecialchars($item['service']) ?></div>
              <div>Estudiante: <?= htmlspecialchars($item['student']) ?></div>
              <div>Cliente: <?= htmlspecialchars($item['client']) ?></div>
            </td>
            <td><?= (int)$item['qty'] ?></td>
            <td><?= $formatCurrency($item['unit_price'], 'GBP') ?></td>
            <td><?= $formatCurrency($line_total, 'GBP') ?></td>
          </tr>
        <?php endfor; ?>
        </tbody>
      </table>

      <hr>

      <aside class="left-column">
        <h4>Notas:</h4>
        <div>
          Factura exenta de IVA según artículo 20. Uno. 10º - Ley 37/1992
        </div>
      </aside>

      <table class="right-column">
        <tr>
          <td>Base imponible en GBP</td>
          <td><?= $formatCurrency($total_gbp, 'GBP') ?></td>
        </tr>
        <tr>
          <td>Base imponible en EUR</td>
          <td>
            <?= $formatCurrency(
              (int)ceil($total_gbp / $invoice['exchange']),
              'EUR',
            ) ?>
          </td>
        </tr>
        <tr>
          <td>IVA (Tipo de IVA 0%)</td>
          <td><?= $formatCurrency(0, 'EUR') ?></td>
        </tr>
        <tr>
          <td>Importe total</td>
          <td><?= $formatCurrency($total_gbp, 'GBP') ?></td>
        </tr>
        <tr>
          <td>Importe pagado</td>
          <td><?= $formatCurrency($total_gbp, 'GBP') ?></td>
        </tr>
        <tr>
          <td>Importe a pagar</td>
          <td><?= $formatCurrency(0, 'GBP') ?></td>
        </tr>
        <tr>
          <td>Tipo de cambio (GBP/EUR)</td>
          <td><?= $invoice['exchange'] ?></td>
        </tr>
      </table>
    </main>
  </body>
</html>
