<?php

use RmsyMe\Components\ExternalLink;

?>

<p>
  As beautiful as Pooptimus is on the outside, we all know it's what's on the
  inside that counts.
  You see, one doesn't build a dung beetle biorobot simply for shits and giggles
  (pun intended).
  The real goal was to venture into the enigmatic labyrinth that is the dung
  beetle brain.
  So let's take a peek inside, shall we?
</p>

<p>
  The part of the brain that's responsible for navigation in insects is called
  the <strong>central complex (CX)</strong>.
  This is a GPS-like structure that acts as a sort of 'mission control',
  reporting on the animal's movement through the world.
  It's an intricate mesh of interlinked neuropils (think neural spaghetti) that
  receives inputs from the eyes and other sensory organs, and sends out
  instructions to the beetle's little legs.
  This ancient and essential system has survived millions of years and is
  remarkably similar across multiple insect species, proving that evolution
  agrees with the adage "if it ain't broke, don't fix it".
</p>

<figure class="figure m-3 text-center col-lg-5 float-start col-12">
  <img
    src="<?= $mediaRoot ?>/img/beetle/cx-full.png"
    class="figure-img img-fluid"
    alt="Central Complex model adapted for dung beetle navigation."
  >
  <figcaption class="figure-caption text-center">
    Traffic lights of the bug brain: Green for going this way, orange for
    remember this way, and blue for 'oops, not that way'.
  </figcaption>
</figure>

<p>
  In the figure here you can see my adaptation of a
  <?=
    (new ExternalLink(
      "https://www.sciencedirect.com/science/article/pii/S0960982217310904",
      "CX model of path integration in bees",
    ))->render()
  ?>
  to straight-line navigation in dung beetles.
  First, let's visit the neighborhood of green neurons.
  These band together to form a ring that works just like a compass.
  They keep a pulse on the beetle's current heading, making sure our little
  navigator knows which direction its facing at the moment.
</p>

<p>
  Next, let's take a walk down memory lane, where the yellow and orange neurons
  reside.
  Think of these as the beetle's trusty old scribes, remembering a 'snapshot'
  of the sky's configuration when the beetle begins its journey.
  They keep this valuable snapshot safe, as it records the direction our
  intrepid dung beetle should be heading if it wants to get away from those
  nasty dung-ball-stealing rivals.
</p>

<p>
  (The snapshot is actually taken while the beetle does a little dance on top of
   its ball, which is probably the cutest thing you'll ever see.
  Unfortunately I didn't have time to integrate this into the CX model, but I
  manually programmed the robot to do a little dance before each roll, because
  it was just too adorable to leave out.)
</p>

<p>
  Our final stop is the blue neuron district.
  Here, we meet the unsung heroes, the diligent workers who keep the wheels, or
  legs, turning.
  They function as the motor behind the beetle's movements, helping it
  course-correct if it strays off the beaten path.
  By comparing what the green neurons are saying (where we're currently heading)
  to what the yellow and orange neurons are saying (where we should be heading),
  they can calculate the direction the beetle should turn in order to get back
  on track.
  Imagine them as a team of highly certified life-coaches (if there is such a
  thing), constantly providing instructions on which way to turn to ensure our
  dung beetle stays on the straight and narrow.
</p>
