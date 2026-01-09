<?php if ($clients): ?>
  <table class="table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($clients as $client): ?>
      <tr>
        <td><?= htmlspecialchars($client['id']) ?></td>
        <td><?= htmlspecialchars($client['name']) ?></td>
      </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
<?php else: ?>
  <p>No clients found.</p>
<?php endif; ?>
