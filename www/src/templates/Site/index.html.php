<?php use RmsyMe\Components\ExternalLink; ?>

<p class="lead">
  Welcome to my slice of the internet pie!
</p>

<p>
  Hi, I'm Ramsey 👋 I'm a software engineer, and without exaggerating
  in the slightest, this website is
  <a href="/projects/rmsy-me/">my Mona Lisa</a>.
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

<p>
  Feel free to explore and discover more <a href="/about">about me</a>,
  <a href="/projects/">my projects</a>, and my passion for software engineering.
</p>

<?php if (isset($projects)): ?>
  <div class="row">
    <?php foreach ($projects as $project): ?>
      <div class="col-sm-6 mb-3 d-flex">
        <div class="card flex-column equal-height">
          <a href="<?= $project['path'] ?>">
            <img
              class="card-img-top"
              src="<?= $project['imagePath'] ?>"
              alt="<?= $project['title'] ?>"
            >
          </a>
          <div class="card-body">
            <h5 class="card-title"><?= $project['title'] ?></h5>
            <p class="card-text"><?= $project['description'] ?></p>   
            <p class="card-text text-center">
              <a href="<?= $project['path'] ?>" class="btn btn-primary">
                Learn more
              </a>
            </p>
          </div>
        </div>
      </div>
    <?php endforeach; ?>
    <div class="col-sm-6 mb-3">
      <div class="card flex-column equal-height">
        <img
          class="card-img-top"
          src="/assets/img/coming-soon.jpg"
          alt="Coming Soon"
        >
        <div class="card-body">
        <h5 class="card-title">Top Secret</h5>
          <p class="card-text">
            A project so secret, even my compiler doesn't know about it yet!
          </p>
          <p class="card-text text-center">
            <a class="btn btn-primary disabled">Stay tuned</a>
          </p>
        </div>
      </div>
    </div>
  </div>
<?php endif; ?>
