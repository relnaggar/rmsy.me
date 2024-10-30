<?php use RMSY\Components\FormInput; ?>

<div class="card">
  <div class="card-header">
    <h6 class="mb-0">Contact form</h6>
  </div>
  <div class="card-body">
    <form action="/contact" method="POST" class="needs-validation" novalidate>
      <?= (new FormInput(
        $name='name',
        $label='Name',
        $type='text',
        $formName='message',
        $autocomplete="on",
        $validationAttributes="required",
        $invalidFeedback='This field cannot be blank.'
      ))->render(); ?>
      <?= (new FormInput(
        $name='email',
        $label='Email',
        $type='email',
        $formName='message',
        $autocomplete="on",
        $validationAttributes=<<<HTML
          maxlength="254"        
          required
        HTML,
        $invalidFeedback='This field cannot be blank and must be a valid email
          address 254 characters or under.',
        $formText=<<<HTML
          This will only be used to forward you a copy of your message and so I
          can reply to your message.
          I'll never share your email with anyone.
        HTML
      ))->render(); ?>
      <?= (new FormInput(
        $name='message',
        $label='Message',
        $type='textarea',
        $formName='message',
        $autocomplete="off",
        $validationAttributes="required",
        $invalidFeedback='This field cannot be blank.'
      ))->render(); ?>
      <input class="btn btn-primary" type="submit" name="submit" value="Submit">
    </form>
  </div>
</div>
