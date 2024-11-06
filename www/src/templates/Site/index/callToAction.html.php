<?php use RmsyMe\Components\ExternalLink; ?>

<?php
  $roles = [
    [
      'header' => 'Ramsey the Engineer',
      'content' => <<<HTML
        I'm a software engineer, specialising in
        <strong>full-stack web application development</strong>.
        That means I can take your wildest web dreams and turn them into
        reality, quickly.
      HTML,
      'call to action' => [
        'href' => '/resumes/full-stack-developer',
        'text' => 'Read my full stack developer resume',
        'external' => true,
      ],
      'icon' => 'terminal-fill',
    ], [
      'header' => 'Ramsey the Educator',
      'content' => <<<HTML
        As an educator, I love to
        <strong>share my knowledge and passion for programming</strong>.
        From beginner to code conjurer, I can help boost your confidence and
        results.
      HTML,
      'call to action' => [
        'href' => '/resumes/tutor',
        'text' => 'Read my tutoring resume',
        'external' => true,
      ],
      'icon' => 'mortarboard-fill',
    ]
  ];
?>

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
          <p class="text-center">
            <?php if (!empty($role['call to action']['external'])): ?>
                <?= (new ExternalLink(
                  $role['call to action']['href'],
                  $role['call to action']['text'],
                  "btn btn-primary",
                ))->render() ?>
            <?php else: ?>
              <a
                href="<?= $role['call to action']['href'] ?>"
                class="btn btn-primary"
              >
                <?= $role['call to action']['text'] ?>
              </a>
            <?php endif; ?>
          </p>
        </div>
      </div>
    </div>
  <?php endforeach; ?>
</div>
