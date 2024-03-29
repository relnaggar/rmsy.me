<p class="lead">Got a burning question? Constructive criticism? Just want to chat about dung beetles?</p>

<p>Feel free to ping me an email, submit the beautifully formatted form below, or even send me a LinkedIn invitation. I've never lost a patient!</p>

<div class="row">
  <div class="col-xxl-7 mb-3">
    <?php if ($message['sent']) { ?>
      <div class="alert alert-success" role="alert">
        <h4 class="alert-heading">Message sent!</h4>
        <p>
          Whoosh!
          Your message is now being hand-delivered by our nimble web gnomes, zip-lining straight into my inbox.
          For an encore, they've backflipped a copy right to the email address you provided.
          High-five!
        </p>
      </div>
    <?php } else { ?>
      <?php if (isset($message['error-code'])) { ?>
        <div class="alert alert-danger" role="alert">
          <h4 class="alert-heading">Message send failure</h4>
            <?php if ($message['error-code'] === 'timeout-or-duplicate') { ?>
              <p>
                Uh-oh!
                Our web gnomes our telling me this was a form resubmission which has failed the reCAPTCHA validation.
                Naughty naughty!
              </p>
              <p>
                If you're definitely not a robot, try submitting the form again.
                But if you are, don't bother -- our gnomes are on to you!
              </p>
            <?php } else if ($message['error-code'] === 'email') { ?>
              <p>
                Oh no! Our web gnomes are telling me the email address you entered is invalid. Whoops!
              </p>
            <?php } else if ($message['error-code'] === 'name') { ?>
              <p>
                Oh no!
                Our web gnomes are telling me the name you entered is too long.
                If you're name is really that long, I'm impressed!
                But there's a 255 character limit on this form, so you'll have to shorten it.
              </p>
            <?php } else if ($message['error-code'] === 'message') { ?>
              <p>
                Oh no!
                Our web gnomes are telling me the message you entered is too long.
                I'm flattered you have so much to say, but there's a 65535 character limit on this form, so you'll have to just give me the highlights.
              </p>
            <?php } else { ?>
              <p>
                Yikes!
                Looks like our web gnomes tripped on a digital banana peel while they were scurrying to deliver your message.
                Fear not, for gnomes are resilient!
                Try tapping that 'Submit' button one more time, you never know.
              </p>
              <p>
                If this keeps happening, it means the contact form may be on a coffee break.
                My deepest apologies!
                To safeguard your message from the perils of the Internet, copy-paste it somewhere safe and catapult it directly into my email inbox instead.
                These gnomes, huh?
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
          <form action="/contact" method="POST" autocomplete="on" class="needs-validation" novalidate>
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
  <div class="col-xxl-5">
    <div class="card mb-3">
      <div class="card-header">
        <h6 class="mb-0">Email</h6>
      </div>
      <div class="card-body">
        <?=includeIcon('envelope')?>
        &nbsp;
        <a href="mailto:ramsey.el-naggar@outlook.com">ramsey.el&#8209;naggar@outlook.com</a>
      </div>
    </div>
    <div class="card mb-3">
      <div class="card-header">
        <h6 class="mb-0">Linkedin</h6>
      </div>
      <div class="card-body">
        <?=includeIcon('linkedin')?>
        &nbsp;
        <a href="/linkedin" target="_blank" rel="noopener noreferrer">rmsy.me/linkedin</a>
        <?=includeIcon('box-arrow-up-right')?>
      </div>
    </div>
  </div>
</div>