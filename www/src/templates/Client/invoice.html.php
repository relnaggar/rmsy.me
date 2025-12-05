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
            <th class="text-start">Fecha</th>
            <th class="text-start">Descripción de servicio</th>
            <th class="text-end">Cantidad</th>
            <th class="text-end">Precio unitario</th>
            <th class="text-end">Importe</th>
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
            <td class="text-start"><?= htmlspecialchars($item['date']) ?></td>
            <?php if (isset($item['student']) && isset($item['client'])): ?>
              <td class="text-start">
                <div><?= htmlspecialchars($item['service']) ?></div>
                <div>Estudiante: <?= htmlspecialchars($item['student']) ?></div>
                <div>Cliente: <?= htmlspecialchars($item['client']) ?></div>
              </td>
            <?php else: ?>
              <td class="text-start"><?= htmlspecialchars($item['service']) ?></td>
            <?php endif; ?>
            <td class="text-end"><?= (int)$item['qty'] ?></td>
            <td class="text-end"><?= $formatCurrency($item['unit_price'], 'GBP') ?></td>
            <td class="text-end"><?= $formatCurrency($line_total, 'GBP') ?></td>
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
          <td class="text-primary">Base imponible en GBP</td>
          <td class="text-end"><?= $formatCurrency($total_gbp, 'GBP') ?></td>
        </tr>
        <tr>
          <td class="text-primary">Base imponible en EUR</td>
          <td class="text-end">
            <?= $formatCurrency(
              (int)ceil($total_gbp / ($invoice['exchange_rate'] / 100000)),
              'EUR',
            ) ?>
          </td>
        </tr>
        <tr>
          <td class="text-primary">IVA (Tipo de IVA 0%)</td>
          <td class="text-end"><?= $formatCurrency(0, 'EUR') ?></td>
        </tr>
        <tr class="fw-bold">
          <td class="text-primary pb-3">Importe total</td>
          <td class="text-end pb-3"><?= $formatCurrency($total_gbp, 'GBP') ?></td>
        </tr>
        <tr>
          <td class="text-primary">Importe pagado</td>
          <td class="text-end"><?= $formatCurrency($total_gbp, 'GBP') ?></td>
        </tr>
        <tr class="fw-bold">
          <td class="text-primary pb-3">Importe a pagar</td>
          <td class="text-end pb-3"><?= $formatCurrency(0, 'GBP') ?></td>
        </tr>
        <tr>
          <td>Tipo de cambio (GBP/EUR)</td>
          <td class="text-end"><?= $invoice['exchange_rate'] / 100000 ?></td>
        </tr>
      </table>
    </main>
  </body>
</html>
