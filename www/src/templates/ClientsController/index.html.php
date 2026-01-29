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
  <form method="post" action="/portal/clients/clear">
    <input type="submit" class="btn btn-danger" value="Delete All Clients" >
  </form>
<?php else: ?>
  <p>No clients found.</p>
<?php endif; ?>
