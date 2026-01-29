<?php if ($lessons): ?>
  <table class="table">
    <thead>
      <tr>
        <th>Date</th>
        <th>Time</th>
        <th>Repeat (Weeks)</th>
        <th>Price (GBP)</th>
        <th>Paid</th>
        <th>Student ID</th>
        <th>Client ID</th>
        <th>Buyer ID</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($lessons as $lesson): ?>
      <tr>
        <td><?= $lesson->getDayDate() ?></td>
        <td><?= $lesson->getFullTime() ?></td>
        <td><?= $lesson->repeat_weeks ?></td>
        <td><?= $lesson->getPriceGbp() ?></td>
        <td><?= $lesson->paid ? 'Yes' : 'No' ?></td>
        <td>
          <?php if ($lesson->student_id !== null): ?>
            <a href="/portal/students/<?= $lesson->student_id ?>">
              <?= $lesson->student_id ?>
            </a>
          <?php else: ?>
            N/A
          <?php endif; ?>
        </td>
        <td>
          <?php if ($lesson->client_id !== null): ?>
            <a href="/portal/clients/<?= $lesson->client_id ?>">
              <?= $lesson->client_id ?>
            </a>
          <?php else: ?>
            N/A
          <?php endif; ?>
        </td>
        <td>
          <?php if ($lesson->buyer_id !== null): ?>
            <a href="/portal/buyers/<?= urlencode($lesson->buyer_id) ?>">
              <?= htmlspecialchars($lesson->buyer_id) ?>
            </a>
          <?php else: ?>
            N/A
          <?php endif; ?>
        </td>
      </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
  <form method="post" action="/portal/lessons/clear">
    <input type="submit" class="btn btn-danger" value="Delete All Lessons">
  </form>
<?php else: ?>
  <p>No lessons found.</p>
<?php endif; ?>
<hr>
<form method="post" action="/portal/lessons">
  <input
    type="submit"
    class="btn btn-primary"
    value="Import Lessons from Calendar"
  >
</form>