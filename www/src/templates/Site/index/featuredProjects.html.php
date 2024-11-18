<hr>

<h2 class="text-center mt-4 mb-3">Featured Projects</h2>

<p class="text-center mb-4">
  Here are some of the projects I've worked on. Click on a project to learn more.
</p>

<div class="row">
  <?php foreach ($featuredProjects as $project): ?>
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
            <div class="card-title h5">
              <?= $project->title ?>
            </div>
            <p class="card-text"><?= $project->thumbnailDescription ?></p>
          </div>
        </div>
      </a>
    </div>
  <?php endforeach; ?>
</div>
