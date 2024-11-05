<?php use RmsyMe\Components\ExternalLink; ?>

<p class="lead">
  Welcome to my slice of the internet pie!
</p>

<p>
  Hi, I'm Ramsey 👋 I'm a software engineer, and without exaggerating
  in the slightest, this website is
  <!-- <a href="/projects/rmsy-me/">my Mona Lisa</a>. -->
  my Mona Lisa.
  My digital masterpiece, constructed brick by binary brick with the sweat from
  my brow as its everlasting mortar.
  I carved this space with my raw and bleeding fingers to serve as a testament
  to the proficiencies I've honed throughout my professional odyssey.
<p>
  
<p>
  Pull up a chair and dive into my digital saga, featuring:
  <ul>
    <li>
      Five transformative years at the University of Edinburgh, resulting in a
      Master of Informatics with First Class Honours and a newfound appreciation
      for the sanctity of sleep.
    </li>
    <li>
      A thrilling experience as a full stack developer interning at a leading IT
      service management provider: I laughed, I cried, I debugged.
      It was there that I sharpened my skills and grew a thick skin for
      real-world coding dramas.
    </li>
    <li>
      <?= $numberOfYearsTutoringAsWord ?> enlightening years educating the world
      in computer science and software engineering, during which I earned the
      title of the UK's top 'Computing University' tutor on the
      esteemed platform,
      <?=
        (new ExternalLink(
          "https://www.mytutor.co.uk/tutors/24851/",
          "MyTutor",
        ))->render()
      ?>.
      No undergrads were harmed in the making of this story.
    </li>
  </ul>  
</p>

<?php foreach ($snippets as $snippet): ?>
  <section>
    <h2><?= $snippet['title'] ?></h2>
    <p>
      <?= $snippet['text'] ?>
      <a href="<?= $snippet['href'] ?>" class="btn btn-primary">
        <?= $snippet['callToAction']?>
      </a>
    </p>
  </section>
<?php endforeach; ?>

<section>
  <h2>Projects</h2>
  <div id="carouselExampleCaptions" class="carousel slide">
    <div class="carousel-indicators">
      <?php for ($i = 0; $i < count($projects); $i++): ?>
        <button
          type="button"
          data-bs-target="#carouselExampleCaptions"
          data-bs-slide-to="<?= $i ?>"
          <?php if ($i === 0): ?>
            class="active"
            aria-current="true"
          <?php endif; ?>
          aria-label="Slide <?= $i + 1 ?>"
        ></button>
      <?php endfor; ?>
    </div>
    <div class="carousel-inner">
      <?php $index = 0; ?>
      <?php foreach ($projects as $projectSlug => $project): ?>
        <div class="carousel-item <?= ($index === 0) ? 'active' : '' ?>">
          <a href="<?= "/projects/$projectSlug" ?>">
            <img
              src="<?= "$mediaRoot/img/{$project['thumbnail']->href}" ?>"
              class="d-block w-100 rounded"
              alt="<?= $project['title'] ?>"
              height="500"
            >
            <div class="carousel-caption d-none d-md-block">
              <h5><?= $project['title'] ?></h5>
              <p><?= $project['description'] ?></p>
            </div>
          </a>
        </div>
        <?php $index = $index + 1; ?>
      <?php endforeach; ?>
    </div>
    <button
      class="carousel-control-prev"
      type="button"
      data-bs-target="#carouselExampleCaptions"
      data-bs-slide="prev"
    >
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Previous</span>
    </button>
    <button
      class="carousel-control-next"
      type="button"
      data-bs-target="#carouselExampleCaptions"
      data-bs-slide="next"
    >
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Next</span>
    </button>
  </div>
</section>