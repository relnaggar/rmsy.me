<?php if ($students): ?>
  <table class="table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($students as $student): ?>
      <tr>
        <td>
          <a href="/client/students/<?= htmlspecialchars($student['id']) ?>">
            <?= htmlspecialchars($student['id']) ?>
          </a>
        </td>
        <td><?= htmlspecialchars($student['name']) ?></td>
      </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
<?php else: ?>
  <p>No students found.</p>
<?php endif; ?>
