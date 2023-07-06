<figure class="figure m-3 text-center w-100">
  <img src="/assets/img/development-deployment.png" class="figure-img img-fluid" alt="UML Deployment Diagram for the development environment.">
  <figcaption class="figure-caption text-center">
    It's all rainbows and butterflies until you realise this is just the development environment -- scroll down if you dare!
  </figcaption>
</figure>

<p>
  Fasten your seatbelts and don your hard hats; we're embarking on a thrilling expedition through the buzzing hive that is my <strong>development environment</strong>, where Docker does the heavy lifting and code reigns supreme.
  Imagine my laptop as the foreman's cabin at a bustling construction site, littered with crumpled sticky notes, doodled papers, and half-empty mugs of yerba mate.
  It's in this chaotic yet strangely comforting sanctuary that I juggle writing code, testing exciting new features, and indulging in a relentless game of whack-a-mole with those mischievous bugs before they dare disrupt the public-facing website.
  In essence, it's where the fun happens!
</p>

<p>
  Amidst this beautiful chaos, our hero Docker holds everything together without even breaking a sweat.
  Docker, for the uninitiated, is a swanky platform that "containerises" your code within a virtual environment, tucked away from the rest of your system like a pearl in an oyster.
  This software superhero saves the day for two pivotal reasons:
  <dl>
    <dt>Portability</dt>
    <dd>
      Docker makes my code as mobile as a nomadic backpacker.
      With Docker, I can code on any system that has Docker installed: my Mac laptop, my friend's Windows PC, or even a Linux server in the cloud.
      Even the production environment only has one dependency.
      You guessed it, Docker!
      It's like having a universal code adapter!
    </dd>

    <dt>Consistency</dt>
    <dd>
      Docker is the master of mimicry, ensuring my development and production environments mirror each other like identical twins.
      This means if my code thrives on my laptop, it's likely to ace its performance on the production server too.
      Adios to those nasty deployment surprises!
    </dd>
  </dl>
</p>

</p>
  And Docker doesn't come alone.
  It brings along a trusty sidekick by the name of Docker volumes.
  Together, they're as harmonious as Netflix and chill, crafting the perfect atmosphere for good ol' local development fun.
  Picture Docker volumes as a magical wormhole, forging a seamless connection between my local files and Docker's bustling containers.
  Any edit I make on my system gets teleported instantaneously to the container, ready for action.
  None of the hassle of re-building or re-deploying; it's re-al-time baby!
</p>

<figure class="figure m-3 text-center w-100">
  <img src="/assets/img/production-deployment.png" class="figure-img img-fluid" alt="UML Deployment Diagram for the production environment.">
  <figcaption class="figure-caption text-center">
    One does not simply 'deploy to production'.
  </figcaption>
</figure>

<p>
  As we transition now from the cozy chaos of the development environment into the daunting reality of the live <strong>production environment</strong>, it's akin to Frodo and Sam's daring leap from the comfort of the Shire into the looming shadow of Mordor.
  It's a place where the website is live, and any mistake could be... well pretty darn embarrassing.
  But fret not, for our fellowship of heroes is here to save the day once again!
</p>

<p>
  First of all, GitHub, our trusty Bag of Holding, safeguards <i>my precious</i> <a href="/projects/website/#source">source code</a>, which is drawn upon for initial deployment or key script alterations. 
  But typically, I, the lone Ring-bearer, meticulously build and test Docker images locally before casting them into the fires of Docker Hub.
  (In a larger fellowship of developers, a cloud-based Continuous Integration service like GitHub Actions would allow us to bear this heavy burden together.)
  Either way, our production server, loyal as Samwise, retrieves the images from Docker Hub, deploying them to the foreboding and dark lands beyond the Black Gate.
</p>

<p>
  But crafting Dockerfiles, the blueprint for Docker images, is akin to forging Rings of Power.
  Lean too far one way and you're saddled with bloated, overladen and Gollum-like images.
  On the other extreme, you're grappling with a slim-but-stubborn base image that's as uncustomisable as the One Ring's true allegiance (I'm looking at you, Alpine Linux).
  So, like a Hobbit rolling up his sleeves to <a href="/projects/website/takeaways">dig in the dirt for some "taters"</a>, I opted to pen my own Dockerfiles from the ground up.
  This ensures a perfect blend of lean, yet configurable images: development images teeming with volumes and <a href="#testing">testing</a> frameworks, production images as unburdened and swift as our two Hobbits on their final ascension of Mount Doom.
</p>

<blockquote class="px-5 blockquote">
  <?=includeIcon('quote')?> End? No, the journey doesn't end here.
  <p class="mt-1 blockquote-footer">Gandalf, <cite title="Lord of the Rings: The Return of the King">Lord of the Rings: The Return of the King</cite></p>
</blockquote>