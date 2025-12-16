<?php if ($lessons): ?>
  <table class="table">
    <thead>
      <tr>
        <th>Lesson ID</th>
        <th>Description</th>
        <th>Date & Time</th>
        <th>Duration (minutes)</th>
        <th>Repeat Weeks</th>
        <th>Price (GBP pence)</th>
        <th>Paid</th>
        <th>Student ID</th>
        <th>Client ID</th>
        <th>Buyer ID</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($lessons as $lesson): ?>
      <tr>
        <td><?= $lesson->id ?></td>
        <td><?= htmlspecialchars($lesson->description) ?></td>
        <td><?= htmlspecialchars($lesson->datetime) ?></td>
        <td><?= $lesson->duration_minutes ?></td>
        <td><?= $lesson->repeat_weeks ?></td>
        <td><?= $lesson->price_gbp_pence ?></td>
        <td><?= $lesson->paid ? 'Yes' : 'No' ?></td>
        <td><?= $lesson->student_id !== null ? $lesson->student_id : 'N/A' ?></td>
        <td><?= $lesson->client_id !== null ? $lesson->client_id : 'N/A' ?></td>
        <td><?= $lesson->buyer_id !== null ? htmlspecialchars($lesson->buyer_id) : 'N/A' ?></td>
      </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
<?php else: ?>
  <p>No lessons found.</p>
<?php endif; ?>
