<div class="row">
  <?php foreach ($projects as $projectSlug => $project): ?>
    <div class="col-sm-6 mb-3 d-flex">
      <div class="card flex-column equal-height">
        <a href="<?= $projectSlug ?>">
          <img
            class="card-img-top"
            src="<?= "$mediaRoot/img/{$project['thumbnail']->href}" ?>"
            alt="<?= $project['title'] ?>"
          >
        </a>
        <div class="card-body">
          <h5 class="card-title">
            <a href="<?= "/projects/$projectSlug" ?>">
              <?= $project['title'] ?>
            </a>
          </h5>
          <p class="card-text"><?= $project['description'] ?></p>
        </div>
      </div>
    </div>
  <?php endforeach; ?>
  <div class="col-sm-6 mb-3">
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
