<p class="lead">
  Got a burning question?
  Constructive criticism?
  Just want to chat about dung beetles?
</p>

<p>
  Feel free to ping me an email, submit the beautifully formatted form below, or
  even send me a LinkedIn invitation.
  I've never lost a patient!
</p>

<div class="row">  
  <div class="col-xxl-7 mb-3">
    <?php $displayAlert && require 'contact/contactFormAlert.html.php' ?>
    <?php $displayForm && require 'contact/contactForm.html.php' ?>
  </div>
  <div class="col-xxl-5">    
    <?php foreach ($contactMethods as $contactMethod): ?>
      <div class="card mb-3">
        <div class="card-header">
          <h6 class="mb-0"><?= $contactMethod['title'] ?></h6>
        </div>
        <div class="card-body">
          <i class="bi bi-<?= $contactMethod['icon'] ?>"></i>
          &nbsp;
          <a
            href="<?= $contactMethod['href'] ?>"
            <?php if ($contactMethod['target'] ?? false): ?>
              target="<?= $contactMethod['target'] ?>"
            <?php endif; ?>
            <?php if ($contactMethod['rel'] ?? false): ?>
              rel="<?= $contactMethod['rel'] ?>"
            <?php endif; ?>
          >
            <?= $contactMethod['html'] ?></a>
          <?php if (
            isset($contactMethod['target'])
            && $contactMethod['target'] === '_blank'
          ): ?>
            <i class="bi bi-box-arrow-up-right"></i>
          <?php endif; ?>
        </div>
      </div>
    <?php endforeach; ?>
  </div>
</div>
