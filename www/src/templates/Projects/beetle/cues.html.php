<figure class="figure m-3 text-center w-100">
  <img
    src="<?= $mediaRoot ?>/img/beetle/sa-skies.jpg"
    class="figure-img img-fluid"
    alt="
      Screenshots from the robot's camera looking up at the South African sky.
    "
  >
  <figcaption class="figure-caption text-center">
    Robot diary, day 6: Staring at the sky... again.
  </figcaption>
</figure>

<p>
  Once upon a time, scientists thought that dung beetles had two different
  visual cues related to brightness: use the sunniest point in the sky as an
  anchor, or just use the general glow of the horizon.
  I even built a fancy model to mimic this idea, but it was about as useful as
  a chocolate teapot!
  Then, my genius supervisor had a light bulb moment –- what if the beetles use
  them both together, like a one-stop-shop for navigation?
  I jumped on this concept and whisked the two factors into one integrated
  "centroid vector" (CV), also called the
  <strong>intensity-gradient cue</strong>.
  Don't believe me?
  Just check out these robot's-eye views of South African skies.
  The black circles are the center of the visual field, and the small red lines
  are the CVs, calculated by integrating the brightness across the whole sky.
  It worked like a charm!
</p>

<figure class="figure m-3 text-center col-lg-5 float-end w-100-lg-down">
  <img
    src="<?= $mediaRoot ?>/img/beetle/cx-path.jpg"
    class="figure-img img-fluid"
    alt="
      CX model extensions, including polarisation flip decision and weighted
      cue integration.
    "
  >
  <figcaption class="figure-caption text-center">
    Our newest CX model update:Now featuring Polarisation Flip Decision™ and
    CueCombination+!
  </figcaption>
</figure>

<p>
  Now, let's chew over the <strong>polarisation cue</strong>.
  I've already shown off the robot's fancy polarisation sensor, but an issue
  neglected in the original CX model was that polarisation only covers 180 of
  the 360 degress you might want to roll in.
  Like using a half-eaten compass, you could be facing one way or its exact
  opposite and get the same polarisation reading.
  So how does the robot -– or beetle, for that matter –- know its nose from its
  tail?
  To tackle this, I masterminded a neurologically-plausible mechanism that can
  flip the polarisation angle if the compass is upside down.
  We don't know for sure yet, but if the beetle's do this too, they're at least
  as smart as me!
</p>

<p>
  So we've got these two navigational aces up our sleeves, intensity-gradient
  and polarisation, but there's only one road to roll our dung ball down.
  What happens when the cues conflict?
  It's like Buridan's Ass, the donkey placed exactly halfway between two equally
  delicious haystacks.
  We can't stall forever or we'll starve to death, so I dived into the science
  to clarify this donkey's dilemma.
  It was about as clear as mud at first, but in the end I clarified the two
  strategies influencing cue choice.
</p>

<dl>
  <dt>Weighting of the whole cue.</dt>
  <dd>
    Let's admit it, we all play favorites.
    If you're choosing between a vending machine sandwich and your mother's
    homemade soup, it's no contest.
    That's how it goes with the intensity-gradient cue -– it's the trusted soup
    over the dubious sandwich.
    I reckon this preference is innate, a product of eons of evolution, and
    varying for different kinds of beetles, e.g. day-rolling beetles favour the
    intensity-gradient cue vs night-rolling beetles favour the polarisation cue.
  </dd>
  <dt>Weighting of each measurement.</dt>
  <dd>
    The importance of each cue for navigation can shift faster than a politician
    backtracking on a campaign promise.
    One minute you're cruising along, heeding the polarisation cue, and –-
    kaboom! -– a big-ass cloud gatecrashes the party and muddles the pattern.
    My theory is that our beetle friends are perpetually tweaking the weights of
     each cue based on the quality of the data received.
    Even better, I already had a metric to measure the quality of each
    measurement: the length of the line for the CV, and the degree of
    polarisation calculated from the polarisation sensor.
  </dd>
</ol>

<figure class="figure m-3 text-center col-lg-5 float-start w-100-lg-down">
  <img
    src="<?= $mediaRoot ?>/img/beetle/sa-posing.jpg"
    class="figure-img img-fluid"
    alt="The robot, outside in South Africa, posing for a camera."
  >
  <figcaption class="figure-caption text-center">
    Pooptimus posing for the camera. Oh yeah, work it!
  </figcaption>
</figure>

<p>
  Finally we come to the most beautiful and satisfying part of the whole
  project.
  When I went to implement these two cue combination strategies, I found that
  <strong>they both fit perfectly into the CX model</strong>.
  Can you believe it?
  I won't bore you with the math, but it was on par with solving one face of a
  Rubik's cube and finding the rest already solved for you.
  Isn't it just the best when a plan comes together?
  I was as happy as a dung beetle in a dung heap.
</p>
