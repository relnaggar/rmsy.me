<figure class="figure m-3 text-center col-lg-6 float-end w-100-lg-down">
  <img src="/assets/img/back/contact-success.png" class="figure-img img-fluid" alt="Successful 'Message sent' message.">
  <img src="/assets/img/back/contact-cool.png" class="figure-img img-fluid" alt="A really cool person sending me a valuable and important message.">
  <figcaption class="figure-caption text-center">
    A really cool person sending me a valuable and important message. 
  </figcaption>
</figure>

<p>
  After all this work, I still needed a way for my digital guests to reach out.
  What if they had questions about my projects?
  What if they wanted to hire me and give me lots of money?
  What if they wanted to send me cool dung beetle photos?
  Say hello to the contact form.
</p>

<p>
  The contact form's lifecycle begins with an extremely awesome and super physically attractive user, just like you, filling out their name, email, and message.
  These are POSTed to the server when the form is submitted and validated to make sure you didn't forget anything.
  The server then API-calls up Google's reCAPTCHA service to make sure you're a human and not a filthy spambot.
  If our overlord Google is satisfied with your humanity, your message will be PHPMailer'd to me, and CC'd to the definitely-not-fake email address you provided.
</p>

<p>    
  By the way, just in case you were trying to totally hack my email password, you should know that my <code>sendMail</code> function uses credentials secured away from the public source code repository.
  In other words, you can't see my email password even if you brought out your snazziest hacker shades and looked at the <a href="/projects/website/#source">source code</a> in green-on-black.
</p>

<figure class="figure m-3 text-center col-lg-6 float-start w-100-lg-down">
  <img src="/assets/img/back/contact-spam.png" class="figure-img img-fluid" alt="A nasty little spambot getting its just comeuppance.">
  <figcaption class="figure-caption text-center">
    A nasty little spambot getting its just comeuppance.
  </figcaption>
</figure>

<p>
  When the stars align and the technology gods smile upon us, a victorious banner of success will unfurl across your screen, indicating your message has embarked on its digital journey to my inbox.
</p>

<p>
  However, if somewhere along the way our techno-wizardry stumbles -- say, a hiccup during reCAPTCHA validation or an email dispatch that decides to take an unexpected coffee break, we'll promptly alert you with an error message.
  In this nightmarish scenario, we'll also copy what you sent back into the form so you can try again without losing all your hard work.
</p>

<p>
  And for all you aspiring spambots out there -- take a good look at what awaits you and reconsider your life choices.
  The humilation suffered by the spambot shown here caused it to immediately change its ways and decide to become a generative AI model instead.
  Now it's making millions of dollars a year and living in the Cloud.
  You could be next!
</p>

<p>
  If you've read this far, you're probably pretty cool so why not <a href="/engineer/contact">give it a whirl</a> -- I'd love to hear from you!
</p>