<?php

use RmsyMe\Components\FormInput;

?>

<form
  action="/client/payments" 
  method="post"
  class="needs-validation"
  novalidate
  enctype="multipart/form-data"
>
  <?= (new FormInput(
    name: 'csvFile',
    label: 'CSV File',
    type: 'file',
    formName: $formName,
    autocomplete: "off",
    extraAttributes: <<<HTML
      required accept=".csv"
    HTML,
    invalidFeedback: 'You must choose a .csv file.'
  ))->render();?>
  <input class="btn btn-primary" type="submit" name="submit" value="Upload">
</form>
