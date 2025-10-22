<?php

use RmsyMe\Components\{
  FormInput,
  Alert
};

?>

<div class="col-12 col-sm-9 col-md-8 col-lg-7 col-xl-6">
  <?php if (!empty($displayAlert)): ?>
    <?php
      $errorMessages = [
        'email' => <<<HTML
          Oh no!
          Our web gnomes are telling me the email address you entered is invalid.
          Whoops!
        HTML,
        'password' => <<<HTML
          Oh no!
          Our web gnomes are telling me the password you entered is invalid.
          Whoops!
        HTML,
        'login' => <<<HTML
          Oh no!
          Our web gnomes are telling me the email and password combination you
          entered hasn't been recognised.
          Whoops!
        HTML,
        'default' => <<<HTML
          <p>
            Login failed!
          </p>
          HTML
      ];
    ?>
    <?= (new Alert(
      'danger',
      'Login failure!',
      $errorMessages[$errorCode ?? 'default']
    ))->render() ?>
  <?php endif; ?>
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
        address 254 characters or under.',
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
