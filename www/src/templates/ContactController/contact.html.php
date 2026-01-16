<?php

use RmsyMe\Components\FormInput;

?>

<p class="lead">
  Got a burning question?
  Constructive criticism?
  Just want to chat about dung beetles?
</p>

<p>
  Feel free to ping me an email, submit the form below, or you can even send me
  a LinkedIn invitation.
  I've never lost a patient!
</p>

<div class="row">
  <div class="col-xxl-7 mb-3">
    <div class="card">
      <div class="card-header">
        <div class="mb-0 h6">Contact form</div>
      </div>
      <div class="card-body">
        <form
          action="/contact"
          method="post"
          class="needs-validation"
          novalidate
        >
          <?= (new FormInput(
            name: 'name',
            label: 'Name',
            type: 'text',
            formName: $formName,
            autocomplete: "on",
            extraAttributes: "required",
            invalidFeedback: 'This field cannot be blank.'
          ))->render(); ?>
          <?= (new FormInput(
            name: 'email',
            label: 'Email',
            type: 'email',
            formName: $formName,
            autocomplete: "on",
            extraAttributes: <<<HTML
              maxlength="254"
              required
            HTML,
            invalidFeedback: 'This field cannot be blank and must be a valid
              email address less than or equal to 254 characters.',
            formText: <<<HTML
              This will only be used so I can reply to your message.
              I'll never share your email with anyone.
            HTML
          ))->render(); ?>
          <?= (new FormInput(
            name: 'subject',
            label: 'Subject',
            type: 'text',
            formName: $formName,
            autocomplete: "off",
            extraAttributes: "tabindex='-1' aria-hidden='true'",
            honeypot: true,
          ))->render(); ?>
          <?= (new FormInput(
            name: 'message',
            label: 'Message',
            type: 'textarea',
            formName: $formName,
            autocomplete: "off",
            extraAttributes: "required",
            invalidFeedback: 'This field cannot be blank.'
          ))->render(); ?>
          <div class="cf-turnstile mb-3" data-sitekey="0x4AAAAAAA0I76BgLIpOMLLa"></div>
          <input class="btn btn-primary" type="submit" name="submit" value="Submit">
        </form>
      </div>
    </div>
  </div>
  <div class="col-xxl-5">
    <?php foreach ($contactMethods as $contactMethod): ?>
      <div class="
        card
        mb-3
        <?= !empty($contactMethod['cta']) ? 'card-cta' : '' ?>
      ">
        <div class="card-header">
          <div class="mb-0 h6"><?= $contactMethod['title'] ?></div>
        </div>
        <div class="card-body">
          <i class="bi bi-<?= $contactMethod['icon'] ?>"></i>
          &nbsp;
          <a
            href="<?= $contactMethod['href'] ?>"
            <?php if ($contactMethod['external'] ?? false): ?>
              target="_blank"
              rel="noopener noreferrer"
            <?php endif; ?>
          >
            <?= $contactMethod['html'] ?></a>
          <?php if ($contactMethod['external'] ?? false): ?>
            <i class="bi bi-box-arrow-up-right"></i>
          <?php endif; ?>
        </div>
      </div>
    <?php endforeach; ?>
  </div>
</div>

<script
  src="https://challenges.cloudflare.com/turnstile/v0/api.js"
  defer
></script>
