<?php if (!empty($sidebarNav)): ?>
  <?php
    $previousPath = $sidebarNav->getPreviousPath();
    $nextPath = $sidebarNav->getNextPath();
  ?>
  <div class="text-center">
    <div class="btn-group">
      <?php if ($previousPath): ?>
        <a href="<?= $previousPath ?>" class="btn btn-primary">
          &#8592; Previous
        </a>
      <?php endif; ?>
      <?php if ($nextPath): ?>
        <a href="<?= $nextPath ?>" class="btn btn-primary">
          Next &#8594;
        </a>
      <?php endif; ?>
    </div>
  </div>
<?php endif; ?>
