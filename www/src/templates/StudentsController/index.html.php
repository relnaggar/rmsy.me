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
            <a href="/portal/students/<?= $student->id ?>">
              <?= $student->id ?>
            </a>
          </td>
          <td><?= htmlspecialchars($student->name) ?></td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
  <form method="POST" action="/portal/students/clear">
    <button type="submit" class="btn btn-danger">Delete All Students</button>
  </form>
<?php else: ?>
  <p>No students found.</p>
<?php endif; ?>
