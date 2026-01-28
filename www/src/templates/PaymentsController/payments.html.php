<?php

use RmsyMe\Components\FormInput;

?>

<?php if ($payments): ?>
  <table class="table">
    <thead>
      <tr>
        <th>Payment ID</th>
        <th>Date</th>
        <th>Amount</th>
        <th>Payment Reference</th>
        <th>Buyer ID</th>
        <th>Invoice number</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($payments as $payment): ?>
      <tr>
        <td><?= $payment->id ?></td>
        <td><?= $payment->getDate() ?></td>
        <td><?= $payment->getFormattedAmount() ?></td>
        <td><?= $payment->payment_reference ?></td>
        <td>
          <a href="/portal/buyers/<?= urlencode($payment->buyer_id) ?>">
            <?= $payment->buyer_id ?>
          </a>
        </td>
        <td><a
          href="/portal/invoices/<?= $payment->getInvoiceNumber() ?>"
          target="_blank"
        >
          <?= $payment->getInvoiceNumber() ?>
        </a></td>
      </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
  <form method="POST" action="/portal/payments/clear">
    <button type="submit" class="btn btn-danger">Delete All Payments</button>
  </form>
<?php else: ?>
  <p>No payments found.</p>
<?php endif; ?>

<form
  action="/portal/payments" 
  method="post"
  class="needs-validation"
  novalidate
  enctype="multipart/form-data"
>
  <?= (new FormInput(
    name: 'csvFile',
    label: 'CSV File',
    type: 'file',
    formName: $formName,
    autocomplete: "off",
    extraAttributes: <<<HTML
      required accept=".csv"
    HTML,
    invalidFeedback: 'You must choose a .csv file.'
  ))->render();?>
  <input class="btn btn-primary" type="submit" name="submit" value="Upload">
</form>
