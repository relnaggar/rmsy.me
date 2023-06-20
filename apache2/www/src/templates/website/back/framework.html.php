<figure class="figure m-3 text-center col-lg-7 float-start w-100-lg-down">
  <img src="/assets/img/routing-sequence.png" class="figure-img img-fluid" alt="Simplified UML Sequence Diagram for the routing and templating sequence.">
  <figcaption class="figure-caption text-center">UML sequence diagram or modern art? You decide.</figcaption>
</figure>

<p>
  Okay, so imagine you're a passenger in a bustling train station.
  This station is like the entry point of this application, the grand gateway to our website.
  When a new passenger (a web request) arrives, the ticket inspector checks their ticket (the URL) against the train timetable (the list of possible routes).
  If there's a matching train, wonderful!
  The passenger hops on, and the train conductor (one of the <a href="#controllers">controllers</a>) takes them on a scenic tour of that beautiful webpage.
  But if the ticket doesn't match any train?
  No entry!
  You're quickly ushered to the <a href="/somenonsense">404 page</a>, where you can catch the next train back home.
</p>

<figure class="figure m-3 text-center col-lg-5 float-end w-100-lg-down">
  <img src="/assets/img/packages-uml.png" class="figure-img img-fluid" alt="Simplified UML Class Diagram for the whole application.">
  <figcaption class="figure-caption text-center">
    Fear not, these complex diagrams are only here to fool you into thinking I'm smart.
    Don't fall for it!
  </figcaption>
</figure>

<p>
  So that's all fine and dandy, but what did I do here that's actually useful?
  "What have I done for you lately?", you might ask.
  Well, now that you mention it, I put together a piece of web magic -- a little wizardry, if you will -- called a framework.
  And not just any framework, but one that's more copy-paste friendly than your best friend's homework!
  Thinking of creating another single-page web application in PHP?
  Not a problem!
  Just grab this super flexible and friendly-as-a-golden-retriever framework, specifically <code><a href="<?=$publicUrl?>index.php" target="_blank">index.php</a></code> <?=includeIcon('box-arrow-up-right')?> and the <code><a href="<?=$frameworkUrl?>" target="_blank">Framework directory</a></code> <?=includeIcon('box-arrow-up-right')?>, insert your application's namespace and voila!
  You're set.
  Sure, you'll need to write your own routes-layout-controllers-and-templates, but let's be real, that's the best part!
  Now, get out there and do some coding, you little rascal you!
</p>