<?php use RMSY\Components\Alert; ?>

<?php if (isset($message['sent']) && $message['sent']): ?>
  <?= (new Alert(
    'success',
    'Message sent!',
    <<<HTML
      Whoosh!
      Your message is now being hand-delivered by our nimble webgnomes,
      zip-lining straight into my inbox.
      For an encore, they've backflipped a copy right to the email address
      you provided.
      High-five!
    HTML
  ))->render() ?>
<?php elseif (isset($message['error-code'])): ?>
  <?php
    $errorMessages = [
      'email' => <<<HTML
        Oh no!
        Our web gnomes are telling me the email address you entered is invalid.
        Whoops!
      HTML,
      'name' => <<<HTML
        Oh no!
        Our web gnomes are telling me the name you entered is too long. If 
        you're name is really that long, I'm impressed!
        But there's a 255 character limit on this form, so you'll have to
        shorten it.
      HTML,
      'message' => <<<HTML
        Oh no!
        Our web gnomes are telling me the message you entered is too long.
        I'm flattered you have so much to say, but there's a 65535 character
        limit on this form, so you'll have to just give me the highlights.
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
          If this keeps happening, it means the contact form may be on a coffee
          break.
          My deepest apologies!
          To safeguard your message from the perils of the Internet, copy-paste
          it somewhere safe and catapult it directly into my email inbox
          instead.
          These gnomes, huh?
        </p>
        HTML
    ];
  ?>
  <?= (new Alert(
    'danger',
    'Message send failure!', 
    $errorMessages[$message['error-code']] ?? $errorMessages['default']
  ))->render() ?>
  </div>
<?php endif; ?>
