<?php

use RmsyMe\Components\FormInput;

?>

<form
  action="/client/clients/<?= $clientId ?>" 
  method="post"
  class="needs-validation"
  novalidate
>
  <?= (new FormInput(
    name: 'id',
    label: 'ID',
    type: 'text',
    formName: $formName,
    autocomplete: "off",
    extraAttributes: 'readonly',
  ))->render();?>
  <?= (new FormInput(
    name: 'name',
    label: 'Name',
    type: 'text',
    formName: $formName,
    autocomplete: "on",
    extraAttributes: 'required',
  ))->render();?>
  <input class="btn btn-primary" type="submit" name="submit" value="Submit">
</form>
