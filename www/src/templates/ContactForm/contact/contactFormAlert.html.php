<?php

use RmsyMe\Components\Alert;

?>

<?php if ($success): ?>
  <?= (new Alert(
    'success',
    'Message sent!',
    <<<HTML
      <p>
        Whoosh!
        Your message is now being hand-delivered by our nimble webgnomes,
        zip-lining straight into my inbox.
        High-five!
      </p>
      <p>
        Here's what you sent:
        <ul>
          <li><strong>Name:</strong> $contactFormData->name</li>
          <li><strong>Email:</strong> $contactFormData->email</li>
          <li><strong>Message:</strong> $contactFormData->message</li>
        </ul>
      </p>
    HTML
  ))->render() ?>
<?php else: ?>
  <?php
    $errorMessages = [
      'name' => <<<HTML
        Oh no!
        Our web gnomes are telling me the name you entered is invalid.
        Whoops!
      HTML,
      'email' => <<<HTML
        Oh no!
        Our web gnomes are telling me the email address you entered is invalid.
        Whoops!
      HTML,
      'message' => <<<HTML
        Oh no!
        Our web gnomes are telling me the message you entered is invalid.
        Whoops!
      HTML,
      'spam' => <<<HTML
        Oh no!
        Our web gnomes are telling me you're a nasty little spambot.
        Shame on you!
      HTML,
      'CAPTCHA' => <<<HTML
        Oh no!
        Our web gnomes are telling me you didn't pass the CAPTCHA test.
        Better luck next time!
      HTML,
      'default' => <<<HTML
        <p>
          Yikes!
          Looks like our web gnomes tripped on a digital banana peel while they
          were scurrying to deliver your message.
          Fear not, for gnomes are resilient!
          Try tapping that 'Submit' button one more time, you never know.
        </p>
        <p>
          If this keeps happening, it means the contact form may be broken.
          My deepest apologies!
          Try reaching out to me through one of the other contact methods listed
          on this page.
        </p>
        HTML
    ];
  ?>
  <?= (new Alert(
    'danger',
    'Message send failure!',
    $errorMessages[$errorCode ?? 'default']
  ))->render() ?>
<?php endif; ?>
