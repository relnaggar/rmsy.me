<?php use RMSY\Components\Alert; ?>

<?php if ($success): ?>
  <?= (new Alert(
    'success',
    'Message sent!',
    <<<HTML
      Whoosh!
      Your message is now being hand-delivered by our nimble webgnomes,
      zip-lining straight into my inbox.
      For an encore, they've backflipped a copy to the same email address
      you provided.
      High-five!
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
