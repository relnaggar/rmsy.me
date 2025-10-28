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
        Please try again.
      HTML,
      'invalid_file_type' => <<<HTML
        Invalid file type!
        Please upload a valid CSV file.
      HTML,
      'import' => <<<HTML
        Failed to import payments from the CSV file.
        Please ensure the file is correctly formatted.
      HTML,
      'database' => <<<HTML
        A database error occurred while importing payments.
        Please try again later.
      HTML,
      'default' => <<<HTML
        Unknown error.
        Please try again later.
      HTML
    ];
  ?>
  <?= (new Alert(
    'danger',
    'Upload failed!',
    $errorMessages[$errorCode ?? 'default']
  ))->render() ?>
<?php endif; ?>
