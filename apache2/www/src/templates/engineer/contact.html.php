<p class="lead">This is the contact page for the software engineering part of the site. This page is still under construction.</p>

<script src="https://www.google.com/recaptcha/api.js" async defer nonce="<?=$recaptcha['nonce']?>"></script>

<form action="/engineer/contact" method="POST">
  <div class="g-recaptcha" data-sitekey="<?=$recaptcha['sitekey']?>"></div>
  <input type="submit" value="Submit">
</form>
