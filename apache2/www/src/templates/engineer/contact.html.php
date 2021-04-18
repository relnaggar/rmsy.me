<p class="lead">Any questions, feedback or general enquiries are welcome. To get in touch, you can send me an email or submit the contact form below. You can also send me an invitation on Linkedin.</p>

<script src="/assets/contact-form.js" async defer></script>
<script src="https://www.google.com/recaptcha/api.js?onload=onloadCallback" async defer nonce="<?=$recaptcha['nonce']?>"></script>

<div class="row">
  <div class="col-xl-8 mb-3">
    <div class="card">
      <div class="card-header">
        <h6 class="mb-0">Contact form</h6>
      </div>
      <div class="card-body">
        <form action="/engineer/contact" method="POST" autocomplete="on" class="needs-validation" novalidate>
          <!-- TODO: value, autofocus -->
          <div class="mb-3">
            <label for="name" class="col-form-label">Name</label>
            <input type="text" class="form-control" id="name" name="message['name']" required>
            <div class="invalid-feedback">
              This field cannot be blank.
            </div>
          </div>
          <div class="mb-3">
            <label for="email" class="col-form-label">Email</label>
            <input type="email" class="form-control" id="email" name="message['email']" maxlength="254" required>
            <div class="invalid-feedback">
              This field cannot be blank and must be a valid email address.
            </div>
            <div class="form-text">
              This will only be used to forward you a copy of your message and so I can reply to your message. I'll never share your email with anyone.
            </div>
          </div>
          <div class="mb-3">
            <label for="message" class="form-label">Message</label>
            <textarea class="form-control" id="message" name="message['message']" rows="3" required autocomplete="off"></textarea>
            <div class="invalid-feedback">
              This field cannot be blank.
            </div>
          </div>
          <div class="mb-3">
            <div class="g-recaptcha" data-sitekey="<?=$recaptcha['sitekey']?>" data-callback="successfulResponseCallback"></div>
            <div class="invalid-feedback">
              The reCAPTCHA box must be checked.
            </div>
          </div>
          <input class="btn btn-primary" type="submit" value="Submit">
        </form>
      </div>
    </div>
  </div>
  <div class="col-xl-4">
    <div class="card mb-3">
      <div class="card-header">
        <h6 class="mb-0">Email</h6>
      </div>
      <div class="card-body">
        <?=includeIcon('envelope')?>
        &nbsp;
        <a href="mailto:engineer@rmsy.me">engineer@rmsy.me</a>
      </div>
    </div>
    <div class="card mb-3">
      <div class="card-header">
        <h6 class="mb-0">Linkedin</h6>
      </div>
      <div class="card-body">
        <?=includeIcon('linkedin')?>
        &nbsp;
        <a href="/linkedin" target="_blank">rmsy.me/linkedin</a>
        <?=includeIcon('box-arrow-up-right')?>
      </div>
    </div>
    <div class="card mb-3">
      <div class="card-header">
        <h6 class="mb-0">Location</h6>
      </div>
      <div class="card-body">
        <?=includeIcon('geo-alt-fill')?>
        &nbsp;
        <a href="https://goo.gl/maps/EaM2LmAu92nDceht8" target="_blank">Alicante, Spain</a>
        <?=includeIcon('box-arrow-up-right')?>
      </div>
    </div>
    <!--
    <div class="card mb-3">
      <div class="card-header">
        <h6 class="mb-0">Resume</h6>
      </div>
      <div class="card-body">
        <?=includeIcon('file-person')?>
        &nbsp;
        <a href="/tutor/resume" target="_bank">PDF</a>
        <?=includeIcon('box-arrow-up-right')?>
      </div>
    </div>
    -->
  </div>
</div>
