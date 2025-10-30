<?php if ($payments): ?>
  <table class="table">
    <thead>
      <tr>
        <th>Payment ID</th>
        <th>Date</th>
        <th>Amount</th>
        <th>Payment Reference</th>
        <th>Payer ID</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($payments as $payment): ?>
      <tr>
        <td><?= $payment->id ?></td>
        <td><?= $payment->getDate() ?></td>
        <td><?= $payment->getFormattedAmount() ?></td>
        <td><?= $payment->payment_reference ?></td>
        <td><?= $payment->payer_id ?>
        </td>
      </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
<?php else: ?>
  <p>No payments found.</p>
<?php endif; ?>

<?php $displayAlert && require 'payments/formAlert.html.php' ?>
<?php require 'payments/form.html.php' ?>
