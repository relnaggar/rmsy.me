<p class="lead">
  Welcome to the home page of my personal website.
</p>

<p>
  Hi, I'm Ramsey and I'm a software engineer. I built this website from scratch to showcase some of the skills I've developed after:
  <div data-nosnippet>
    <ul>
      <li>studying informatics at the University of Edinburgh for five years (Master of Informatics with First Class Honours),</li>
      <li>privately teaching university students for four years (top 'Computing University' tutor in the UK on the leading tuition platform <a href="https://www.mytutor.co.uk/tutors/24851/">MyTutor</a>), and</li>
      <li>working professionally as a full stack developer (at a leading IT service management provider).</li>
    </ul>
  </div>
</p>

<p>
  
</p>

<p class="text-center">
  <a href="/engineer/about" class="btn btn-primary">Read my story</a>
</p>

<!-- <div class="card mb-3">
  <img src="/assets/img/hero-shot.jpg" class="w-100" alt="Hero shot">
  <div class="card-body">
    <p class="card-text text-center">Me (left) restarting the robot I built for my Master's project (right). We're trying to outsmart the dung beetle.</p>
  </div>
</div> -->

<div class="row">
  <?php foreach ($projects as $project) { ?>
    <div class="col-sm-6 mb-3">
      <div class="card">
        <a href="<?=$project['path']?>"><img class="card-img-top" src="<?=$project['imagePath']?>" alt="<?=$project['title']?>"></a>
        <div class="card-body">
          <h5 class="card-title"><?=$project['title']?> project</h5>
          <p class="card-text"><?=$project['description']?></p>   
          <p class="card-text text-center"><a href="<?=$project['path']?>" class="btn btn-primary">Learn more</a></p>
        </div>
      </div>
    </div>
  <?php } ?>
  <div class="col-sm-6 mb-3">
    <div class="card">
      <img class="card-img-top" src="/assets/img/coming-soon.jpeg" alt="Coming Soon">
      <div class="card-body">
        <h5 class="card-title">More projects pending write-up.</h5>
        <!-- <p class="card-text">...</p> -->
        <p class="card-text text-center"><a class="btn btn-primary disabled">Coming soon</a></p>
      </div>
    </div>
  </div>
</div>
