<?php

use RmsyMe\Components\FormInput;

?>

<form
  action="/portal/buyers/<?= urlencode($buyerId) ?>" 
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
  <?= (new FormInput(
    name: 'address1',
    label: 'Address 1',
    type: 'text',
    formName: $formName,
    autocomplete: "on",
  ))->render();?>
  <?= (new FormInput(
    name: 'address2',
    label: 'Address 2',
    type: 'text',
    formName: $formName,
    autocomplete: "on",
  ))->render();?>
  <?= (new FormInput(
    name: 'address3',
    label: 'Address 3',
    type: 'text',
    formName: $formName,
    autocomplete: "on",
  ))->render();?>
  <?= (new FormInput(
    name: 'town_city',
    label: 'Town/City',
    type: 'text',
    formName: $formName,
    autocomplete: "on",
  ))->render();?>
  <?= (new FormInput(
    name: 'state_province_county',
    label: 'State/Province/County',
    type: 'text',
    formName: $formName,
    autocomplete: "on",
  ))->render();?>
  <?= (new FormInput(
    name: 'zip_postal_code',
    label: 'ZIP/Postal Code',
    type: 'text',
    formName: $formName,
    autocomplete: "on",
  ))->render();?>
  <?= (new FormInput(
    name: 'country',
    label: 'Country',
    type: 'select',
    formName: $formName,
    autocomplete: "on",
    options: [
      '' => 'Select a country',
      ...$countryOptions,
    ],
    extraAttributes: 'required',
  ))->render();?>
  <?= (new FormInput(
    name: 'extra',
    label: 'Extra',
    type: 'text',
    formName: $formName,
    autocomplete: "on",
  ))->render();?>
  <input class="btn btn-primary" type="submit" name="submit" value="Submit">
</form>
