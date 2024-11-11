<figure class="figure m-3 text-center col-lg-5 float-end col-12">
  <img
    src="<?= $mediaRoot ?>/img/sdp/final-wheels-gears.jpg"
    class="figure-img img-fluid"
    alt="Close-up of the final wheelbase and gearchain design."
  >
  <figcaption class="figure-caption text-center">
    Moving up a gear: the redesigned wheelbase and gearchain.
  </figcaption>
</figure>

<p>
  Our LEGO champion was going to need more than just the ability to stand
  upright.
  It also needed to be a good little Robo-Messi and do what Daddy Computer told
  it to do.
  This required a two-way walkie-talkie-esque communication system, commands
  going one way, sensor gossip from the bot's live field-excursion going the
  other way.
</p>

<p>
  But my first attempt at this was like an intense game of charades with a
  deafblind teammate.
  Like an awkward first date, my initial system would often misinterpret and
  flat-out ignore cruical signals, resulting in the robot doing, well nothing.
</p>

<p>
  This required a Doctor Phil-style intervention, and after several counselling
  sessions, I decided to spice up the relationship with 'stop-and-wait' -- a
  fancy way of making sure both parties are on the same page.
  With zero room for miscommunication, this protocol ensures every packet of
  data is received, understood, and acknowledged before moving on to the next
  one.
  No more dropped calls or misunderstood texts.
  No more stoic silence when the command was to charge forward. 
</p>

<p>
  <strong>My contributions:</strong> this part was all me, and I implemented the
  communication protocol myself from scratch on both the computer in Python and
  the Arduino in C.
  In the spirit of collaboration, I also wrote and shared a guide that was
  eventually used by everyone in the year to configure their radio hardware
  (previously a source of widespread confusion).
</p>