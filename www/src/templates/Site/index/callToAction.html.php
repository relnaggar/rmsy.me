<?php use RmsyMe\Components\ExternalLink; ?>

<div class="row">
  <?php foreach ($roles as $role): ?>
    <div class="col-sm">
      <div class="card mb-3">
        <div class="card-header pt-3">
          <h5>
            <?= $role['header'] ?>
            <i class="bi bi-<?= $role['icon'] ?>"></i>
          </h5>
        </div>
        <div class="card-body">
          <p>
            <?= $role['content'] ?>
          </p>
          <p>
            <?php foreach ($role['callsToAction'] as $cta): ?>
              <?php $cta['class'] = 'btn btn-' . $cta['btn-type'] . ' mb-2'; ?>
              <?php if (!empty($cta['external'])): ?>
                  <?= (new ExternalLink(
                    $cta['href'],
                    $cta['text'],
                    $cta['class'],
                  ))->render() ?>
              <?php else: ?>
                <a
                  href="<?= $cta['href'] ?>"
                  class="<?= $cta['class'] ?>"
                >
                  <?= $cta['text'] ?>
                </a>
              <?php endif; ?>
            <?php endforeach; ?>
          </p>
        </div>
      </div>
    </div>
  <?php endforeach; ?>
</div>
