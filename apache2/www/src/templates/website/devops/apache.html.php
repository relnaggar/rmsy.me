<figure class="figure m-3 text-center col-lg-7 float-start w-100-lg-down">
  <img src="/assets/img/devops/mozilla-observatory.png" class="figure-img img-fluid" alt="A+ rating from Mozilla's HTTP Observatory.">
  <figcaption class="figure-caption text-center">
    My parents can finally be proud of me!
    Will you love me now, Dad?
  </figcaption>
</figure>

<p>
  Pulling off an A+ grade on the <a href="https://observatory.mozilla.org/analyze/rmsy.me" target="_blank" rel="noopener noreferrer">Mozilla Observatory test</a> <?=includeIcon('box-arrow-up-right')?> feels like nailing the final round of <i>Who Wants to Be a Millionaire?</i> (still waiting for my check, Chris Tarrant).
  This isn't your typical 'color inside the lines' assignment; it's a labyrinth of security configurations aimed at safeguarding my crown jewels: this website.
  With my sleeves rolled up and my toolbox in one hand, I scaled the tower of Apache server configuration, tediously tweaking <code>.conf</code> files by hand.
  My crowning achievement?
  A Content Security Policy that functions like a 7-foot bouncer at the most exclusive club in town, admitting only what's essential, like our friendly <a href="/projects/website/back#contactForm">reCAPTCHA button</a>.
  Everything else is turned away at the door, ensuring our website's security remains unbreachable.
</p>

<figure class="figure m-3 text-center col-lg-5 float-end w-100-lg-down">
  <img src="/assets/img/devops/ssl.png" class="figure-img img-fluid" alt="Proof that the website uses HTTPS.">
  <figcaption class="figure-caption text-center">
    Feeling secure? That's because you are!
  </figcaption>
</figure>

<p>
  But the fun didn’t stop there.
  Like a high-speed roller coaster, I put Cloudflare CDN to work to turbocharge the website's performance, ensuring pages load faster than you can say "fibre-optics".
  And to create that warm, fuzzy feeling of trust, I used Let's Encrypt SSL certificates, providing HTTPS to assure users that their data is chauffeured to the club in safely encrypted limousines.
  For extra credit, I even took on the challenge of handling two domains on the same Apache web server, like a master juggler keeping two balls effortlessly in the air.
  The other domain is <a href="https://el-naggar.co.uk">el-naggar.co.uk</a>, which currently just redirects you back to rmsy.me.
  All it took was implementing a VirtualHost with the precision that would make a Swiss watchmaker proud.
  If only Dad could be proud of me too.
</p>