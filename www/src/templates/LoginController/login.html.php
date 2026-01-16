<?php

use RmsyMe\Components\FormInput;

?>

<div class="col-12 col-sm-9 col-md-8 col-lg-7 col-xl-6">
  <form
    action="/client/login"
    method="post"
    class="needs-validation"
    novalidate
  >
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
        address less than or equal to 254 characters.',
    ))->render(); ?>
    <?= (new FormInput(
      name: 'password',
      label: 'Password',
      type: 'password',
      formName: $formName,
      autocomplete: "on",
      extraAttributes: "required",
      invalidFeedback: 'This field cannot be blank.',
    ))->render(); ?>
    <input class="btn btn-primary" type="submit" name="submit" value="Submit">
  </form>
</div>
