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
        <td>
          <a href="/portal/clients/<?= $client->id ?>">
            <?= $client->id ?>
          </a>
        </td>
        <td><?= htmlspecialchars($client->name) ?></td>
      </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
  <form method="POST" action="/portal/clients/clear">
    <button type="submit" class="btn btn-danger">Delete All Clients</button>
  </form>
<?php else: ?>
  <p>No clients found.</p>
<?php endif; ?>
