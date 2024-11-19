<?php

use RmsyMe\Components\FormInput;

?>

<div class="card">
  <div class="card-header">
    <div class="mb-0 h6">Contact form</div>
  </div>
  <div class="card-body">
    <?php
      $formName = 'contactForm';
    ?>
    <form
      action="/contact"
      method="POST"
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
        invalidFeedback: 'This field cannot be blank and must be a valid email
          address 254 characters or under.',
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

<script
  src="https://challenges.cloudflare.com/turnstile/v0/api.js"
  defer
></script>
