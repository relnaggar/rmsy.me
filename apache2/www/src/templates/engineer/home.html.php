<p class="lead">
  Welcome to my slice of the internet pie!
</p>

<p>
  Hello there, I'm Ramsey -- not just your average software engineer, but a virtuoso conducting symphonies of syntax and semicolons. Without exaggerating in the slightest, this website is <a href="/projects/website/">my Mona Lisa</a>.
  My digital masterpiece, constructed brick by binary brick with the sweat from my brow as its everlasting mortar.
  I carved this space with my raw and bleeding fingers to serve as a testament to the proficiencies I've honed throughout my professional odyssey.
<p>
  
<p>
  Pull up a chair and dive into my digital saga, featuring:
  <ul>
    <li>Five transformative years at the University of Edinburgh, resulting in a Master of Informatics with First Class Honours and a newfound appreciation for the sanctity of sleep.</li>
    <li>
      A thrilling experience as a full stack developer interning at a leading IT service management provider: I laughed, I cried, I debugged.
      It was there that I sharpened my skills and grew a thick skin for real-world coding dramas.
    </li>
    <li>
      <?= $numberOfYearsTutoring ?> enlightening years educating the world in computer science and software engineering, during which I earned the rather grand title of the UK's top 'Computing University' tutor on the esteemed platform, <a href="https://www.mytutor.co.uk/tutors/24851/" target="_blank" rel="noopener noreferrer">MyTutor</a> <?=includeIcon('box-arrow-up-right')?>.
      No undergrads were harmed in the making of this story.
    </li>
  </ul>  
</p>

<p>
  Feel free to explore and discover more <a href="/about">about me</a>, my projects, and my passion for software engineering.
</p>

<div class="row">
  <?php foreach ($projects as $project) { ?>
    <div class="col-sm-6 mb-3 d-flex">
      <div class="card flex-column equal-height">
        <a href="<?=$project['path']?>"><img class="card-img-top" src="<?=$project['imagePath']?>" alt="<?=$project['title']?>"></a>
        <div class="card-body">
          <h5 class="card-title"><?=$project['title']?></h5>
          <p class="card-text"><?=$project['description']?></p>   
          <p class="card-text text-center"><a href="<?=$project['path']?>" class="btn btn-primary">Learn more</a></p>
        </div>
      </div>
    </div>
  <?php } ?>
  <div class="col-sm-6 mb-3">
    <div class="card flex-column equal-height">
      <img class="card-img-top" src="/assets/img/coming-soon.jpg" alt="Coming Soon">
      <div class="card-body">
      <h5 class="card-title">Top Secret</h5>
        <p class="card-text">A project so secret, even my compiler doesn't know about it yet!</p>
        <p class="card-text text-center"><a class="btn btn-primary disabled">Stay tuned</a></p>
      </div>
    </div>
  </div>
</div>
