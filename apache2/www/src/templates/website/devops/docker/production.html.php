<figure class="figure m-3 text-center w-100">
  <img src="/assets/img/devops/production-deployment.png" class="figure-img img-fluid" alt="UML Deployment Diagram for the production environment.">
  <figcaption class="figure-caption text-center">
    One does not simply 'deploy to production'.
  </figcaption>
</figure>

<p>
  As we transition now from the cozy chaos of the development environment into the daunting reality of the <strong>production environment</strong>, it's akin to Frodo and Sam's daring leap from the comfort of the Shire into the looming shadow of Mordor.
  Production means the website is live, and any blunder here could be... well pretty darn embarrassing.
  But fret not, for our fellowship is well-equipped to handle this perilous journey.
</p>

<p>
  First in line, GitHub, our trusty Bag of Holding, dutifully safeguards <i>my precious</i> <a href="/projects/website/#source">source code</a>.
  Yet our seasoned production server, akin to the wise old Gandalf, only reaches into this repository <i>precisely when it means to</i>.
  Preferring instead to delegate, it entrusts most of the hard work to its faithful hobbit, namely, me.
  On a typical day, I —- embodying the lone Ring-bearer -— instead cast my meticulously built and tested Docker images into the fires of Docker Hub, from whence they are retrieved by the production server.
  This method serves me well as a solo developer, but amidst a larger fellowship this heavy burden would be collectively shouldered by continuous integration tools e.g. GitHub Actions.
  A hobbit can only do so much!
</p>

<p>
  Oh and I didn't even tell you about crafting those darn Dockerfiles.
  Lean too far one way and you're saddled with a bloated, overladen and Gollum-like image.
  The other, you're grappling with a slim-but-stubborn base image that's as uncustomisable as the One Ring's true allegiance (I'm looking at you, Alpine Linux).
  So, like a hobbit <a href="/projects/website/takeaways">digging in the dirt</a> for some "taters", I opted to pen my own Dockerfiles from the ground up.
  This ensures a perfect blend of lean, yet configurable images: development images teeming with volumes and <a href="#testing">testing</a> frameworks, and production images as swift and unburdened as our two hobbits escaping from the erupting Mount Doom.
  What an adventure!
</p>

<blockquote class="px-5 blockquote">
  End? No, the journey doesn't end here.
  <p class="mt-1 blockquote-footer">Gandalf</p>
</blockquote>