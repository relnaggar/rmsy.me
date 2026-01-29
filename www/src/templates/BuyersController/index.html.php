<?php if ($buyers): ?>
  <table class="table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Country</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($buyers as $buyer): ?>
      <tr>
        <td>
          <a href="/portal/buyers/<?= urlencode($buyer->id) ?>">
            <?= htmlspecialchars($buyer->id) ?>
          </a>
        </td>
        <td><?= htmlspecialchars($buyer->name) ?></td>
        <td><?= htmlspecialchars($buyer->getCountryName()) ?></td>
      </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
  <form method="post" action="/portal/buyers/clear">
    <input type="submit" class="btn btn-danger" value="Delete All Buyers">
  </form>
<?php else: ?>
  <p>No buyers found.</p>
<?php endif; ?>
