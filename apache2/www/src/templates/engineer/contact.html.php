<p class="lead">Any questions, feedback or general enquiries are welcome. To get in touch, you can send me an email or submit the contact form below. You can also send me an invitation on Linkedin.</p>

<div class="row">
  <div class="col-xl-8 mb-3">
    <?php if ($message['sent']) { ?>
      <div class="alert alert-success" role="alert">
        <h4 class="alert-heading">Message sent!</h4>
        <p>
          Your message has been sent successfully.
          As confirmation, a copy of your message has also been forwarded to your email address.
        </p>
      </div>
    <?php } else { ?>
      <?php if (isset($message['error-code'])) { ?>
        <div class="alert alert-danger" role="alert">
          <h4 class="alert-heading">Message send failure</h4>
            <?php if ($message['error-code'] === 'timeout-or-duplicate') { ?>
              <p>
                It looks like this was a form resubmission which has failed the reCAPTCHA validation. Try manually resubmitting the form below. You can do this by checking the reCAPTCHA box and pressing the Submit button.
              </p>
            <?php } else { ?>
              <p>
              It looks like there was some kind of internal error when trying to validate your message with reCAPTCHA or when trying to send your message as an email. This might just be a one-off problem, so try submitting your message again using the form below.
              </p>
              <p>
                If you keep seeing this error message, it probably indicates that the contact form is no longer working. Sorry about this! The best thing to do is copy the message that you've written below so you don't lose it and then send it to me in an email instead.
              </p>
            <?php } ?>
        </div>
      <?php } ?>
      <div class="card">
        <div class="card-header">
          <h6 class="mb-0">Contact form</h6>
        </div>
        <div class="card-body">
          <script src="/assets/contact-form.js" async defer></script>
          <script src="https://www.google.com/recaptcha/api.js?onload=onloadCallback" async defer nonce="<?=$recaptcha['nonce']?>"></script>
          <form action="/engineer/contact" method="POST" autocomplete="on" class="needs-validation" novalidate>
            <div class="mb-3">
              <label for="name" class="col-form-label">Name</label>
              <input type="text" class="form-control" id="name" name="message[name]" value="<?=$_POST['message']['name'] ?? ''?>" required>
              <div class="invalid-feedback">
                This field cannot be blank.
              </div>
            </div>
            <div class="mb-3">
              <label for="email" class="col-form-label">Email</label>
              <input type="email" class="form-control" id="email" name="message[email]" value="<?=$_POST['message']['email'] ?? ''?>" maxlength="254" required>
              <div class="invalid-feedback">
                This field cannot be blank and must be a valid email address.
              </div>
              <div class="form-text">
                This will only be used to forward you a copy of your message and so I can reply to your message. I'll never share your email with anyone.
              </div>
            </div>
            <div class="mb-3">
              <label for="message" class="form-label">Message</label>
              <textarea class="form-control" id="message" name="message[message]" rows="3" required autocomplete="off"><?=$_POST['message']['message'] ?? ''?></textarea>
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
            <input class="btn btn-primary" type="submit" name="submit" value="Submit">
          </form>
        </div>
      </div>
    <?php } ?>
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
        <h6 class="mb-0">Wellfound (formerly AngelList Talent)</h6>
      </div>
      <div class="card-body">
        <?=includeIcon('wellfound')?>
        &nbsp;
        <a href="/wellfound" target="_blank">rmsy.me/wellfound</a>
        <?=includeIcon('box-arrow-up-right')?>
      </div>
    </div>
  </div>
</div>