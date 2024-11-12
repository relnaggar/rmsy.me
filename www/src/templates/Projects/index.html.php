<div class="row">
  <?php foreach ($projects as $project): ?>
    <div class="col-sm-6 mb-3 d-flex">
      <a
        href="<?= $project->getPath() ?>"
        class="text-reset text-decoration-none d-flex"
      >
        <div class="card flex-column equal-height">
          <img
            class="card-img-top"
            src="<?= "$mediaRoot/img/{$project->thumbnail->href}" ?>"
            alt="<?= $project->title ?>"
          >
          <div class="card-body">
            <h5 class="card-title">
              <?= $project->title ?>
            </h5>
            <p class="card-text"><?= $project->thumbnailDescription ?></p>
          </div>
        </div>
      </a>
    </div>
  <?php endforeach; ?>
  <div class="col-sm-6 mb-3 d-flex">
    <div class="card flex-column equal-height">
      <img
        class="card-img-top"
        src="<?= "$mediaRoot/img/coming-soon.jpg"?>"
        alt="Coming Soon"
      >
      <div class="card-body">
      <h5 class="card-title">Top Secret</h5>
        <p class="card-text">
          A project so secret, even my compiler doesn't know about it yet!
          Stay tuned for more details.
        </p>
      </div>
    </div>
  </div>
</div>