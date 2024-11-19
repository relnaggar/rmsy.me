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
    <?php $displayAlert && require 'contact/contactFormAlert.html.php' ?>
    <?php $displayForm && require 'contact/contactForm.html.php' ?>
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
