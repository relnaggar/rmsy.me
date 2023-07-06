<p>
  Brace yourselves for a tale of transformation.
  You see, it was back in a simpler time when past-me first dared to reach for the clouds.
  Prior to this, I was under the tyranny of GoDaddy, which was hosting an earlier, less sophisticated -- okay absolutely grotesque -- avatar of this very website.
  But a rebellion was brewing, and it was time to grow up and overthrow my metaphorical Daddy.  
</p>

<p>
  Fast forward to that fateful night in Thailand.
  Exhausted yet exhilarated after a grueling day of Muay Thai training, a wild idea sparked in my mind -- why not "check out" AWS and "quickly" spin up my own server?
  Little did I know, I was plunging headfirst into a cocoon of frustration, confusion, and despair.
  But from every chrysalis eventually emerges a victorious butterfly, and after my transformation I had four new wings:
  <ul>
    <li>
      <strong>L</strong>:
      A finely-tuned AWS EC2 instance, running Amazon <strong>Linux</strong> 2 like a well-oiled machine.
    </li>

    <li>
      <strong>A</strong>:
      Another cog in the machine, my <a href="#apache">hand-configured</a> <strong>Apache</strong> 2 HTTP Server.
      Why Apache?
      Because Google said it was the most popular web server, and who was I to argue?
      Bayesian prior for the win!
    </li>

    <li>
      <strong>P</strong>:
      A living, breathing <strong>PostgreSQL</strong> database service -- I didn't have any data to store, but by golly I was going to store it well!
    </li>

    <li>
      <strong>P</strong>:
      The <strong>PHP</strong> Apache module for all my server-side scripting needs.
    </li>
</ul>
</p>

<p>
  In other words, my digital baby, the <strong>LAPP</strong> stack, was born, screaming its first words: "Hello, World!".
  What could possibly go wrong?
</p>

<p>
  But then reality hit.
  Every tweak made to this stack on the Cloud needed a similar but sometimes slightly different change on my local machine.
  The <a href="/projects/website/back#templating"><strong>laziness principle</strong></a> was being violated, and I was not happy.
  Sure, GitHub was my handy sidekick for the website content itself, but what if PHP rolled out a new version?
  What if my cool developer friends introduced me to an irresistible Apache module?
  Worse, what if after finally starting my mega successful online business I had to rapidly onboard a platoon of 100 expert developers, and one of them was running (gulp) Windows?
</p>

<p>
  Suddenly, my self-awarded developer badge didn't shine so bright.
  There must be a better way, a secret island known only to the coding Illuminati.
  Like a ship coming home, I sailed into the welcoming arms of Docker.
</p>