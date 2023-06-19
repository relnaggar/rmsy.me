<?php if (isset($sidebar) && ($sidebar->getPreviousPath() || $sidebar->getNextPath())) { ?>
  <div class="text-center">
    <div class="btn-group">
      <?php if ($sidebar->getPreviousPath()) { ?>
        <a href="<?=$sidebar->getPreviousPath()?>" class="btn btn-primary">&#8592; Previous</a>
      <?php } ?>
      <?php if ($sidebar->getNextPath()) { ?>
        <a href="<?=$sidebar->getNextPath()?>" class="btn btn-primary">Next &#8594;</a>
      <?php } ?>
    </div>
  </div>
<?php } ?>