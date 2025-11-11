<!DOCTYPE html>
<html>
  <head>
    <title>Factura <?= $invoice['number'] ?></title>
  </head>
  <body>
    <div>
      <strong>Número de factura:</strong>
      <?= $invoice['number'] ?>
    </div>
    <div><strong>Factura de:</strong></div>
    <?php foreach ($sellerAddress as $line): ?>
      <div><?= htmlspecialchars($line) ?></div>
    <?php endforeach; ?>
    <div><strong>Factura a:</strong></div>
    <?php foreach ($payerAddress as $line): ?>
      <div><?= htmlspecialchars($line) ?></div>
    <?php endforeach; ?>

    <div><strong>Fecha de expedición:</strong></div>
    <div><?= $invoice['issue_date'] ?></div>
    <div><strong>Fecha de vencimiento:</strong></div>
    <div>Pagado</div>

    <table>
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
      <?php foreach ($items as $item): ?>
        <?php
          $line_total = $item['qty'] * $item['unit_price'];
          $total_gbp += $line_total;
        ?>
        <tr>
          <td><?= htmlspecialchars($item['date']) ?></td>
          <td>
            <div><?= htmlspecialchars($item['service']) ?></div>
            <div>Estudiante: <?= htmlspecialchars($item['student']) ?></div>
            <div>Cliente: <?= htmlspecialchars($item['client']) ?></div>
          </td>
          <td><?= (int)$item['qty'] ?></td>
          <td><?= $item['unit_price'] ?></td>
          <td><?= $line_total ?></td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>

    <table>
      <tr>
        <td>Base imponible en GBP</td>
        <td><?= $total_gbp ?></td>
      </tr>
      <tr>
        <td>Base imponible en EUR</td>
        <td><?= ceil($total_gbp / $invoice['exchange']) ?></td>
      </tr>
      <tr>
        <td>IVA (Tipo de IVA 0%)</td>
        <td>0.00</td>
      </tr>
      <tr>
        <td>Importe total</td>
        <td><?= $total_gbp ?></td>
      </tr>
      <tr>
        <td>Importe pagado</td>
        <td><?= $total_gbp ?></td>
      </tr>
      <tr>
        <td>Importe a pagar</td>
        <td><?= 0.0 ?></td>
      </tr>
      <tr>
        <td>Tipo de cambio (GBP/EUR)</td>
        <td><?= $invoice['exchange'] ?></td>
      </tr>
    </table>

    <div><strong>Notas:</strong></div>
    <div>Factura exenta de IVA según artículo 20. Uno. 10º - Ley 37/1992</div>
  </body>
</html>
