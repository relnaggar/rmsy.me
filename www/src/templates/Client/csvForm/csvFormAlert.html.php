<?php

use RmsyMe\Components\Alert;

?>

<?php if ($success): ?>
  <?= (new Alert(
    'success',
    'Upload successful!',
    <<<HTML
      <p>
        Success!
      </p>
    HTML
  ))->render() ?>
<?php else: ?>
  <?php
    $errorMessages = [
      'upload' => <<<HTML
        Upload failed!
      HTML,
      'invalid_file_type' => <<<HTML
        Invalid file type!
      HTML,
      'default' => <<<HTML
        Unknown error.
        HTML
    ];
  ?>
  <?= (new Alert(
    'danger',
    'Upload failed!',
    $errorMessages[$errorCode ?? 'default']
  ))->render() ?>
<?php endif; ?>
