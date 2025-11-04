<?php

declare(strict_types=1);

namespace RmsyMe\Models;

use Relnaggar\Veloz\Data\AbstractFormData;
use PrinsFrank\Standards\Country\CountryAlpha2;

class Payer extends AbstractFormData
{
  public string $id;
  public string $name;
  public ?string $address1;
  public ?string $address2;
  public ?string $address3;
  public ?string $town_city;
  public ?string $state_province_county;
  public ?string $zip_postal_code;
  public string $country;
  public ?string $extra;

  public function validate(): array
  {
    $errors = [];

    // validate name
    if (
      empty($this->name)
      || strlen($this->name) > 255
    ) {
      $errors['name'] = <<<HTML
        Name is required and must be less than or equal to 255 characters.
        Please try again.
      HTML;
    }

    // validate address1
    if (
      !empty($this->address1)
      && strlen($this->address1) > 255
    ) {
      $errors['address1'] = <<<HTML
        Address 1 must be less than or equal to 255 characters.
        Please try again.
      HTML;
    }

    // validate address2
    if (
      !empty($this->address2)
      && strlen($this->address2) > 255
    ) {
      $errors['address2'] = <<<HTML
        Address 2 must be less than or equal to 255 characters.
        Please try again.
      HTML;
    }

    // validate address3
    if (
      !empty($this->address3)
      && strlen($this->address3) > 255
    ) {
      $errors['address3'] = <<<HTML
        Address 3 must be less than or equal to 255 characters.
        Please try again.
      HTML;
    }

    // validate town_city
    if (
      !empty($this->town_city)
      && strlen($this->town_city) > 100
    ) {
      $errors['town_city'] = <<<HTML
        Town/City must be less than or equal to 100 characters.
        Please try again.
      HTML;
    }

    // validate state_province_county
    if (
      !empty($this->state_province_county)
      && strlen($this->state_province_county) > 100
    ) {
      $errors['state_province_county'] = <<<HTML
        State/Province/County must be less than or equal to 100 characters.
        Please try again.
      HTML;
    }

    // validate zip_postal_code
    if (
      !empty($this->zip_postal_code)
      && strlen($this->zip_postal_code) > 20
    ) {
      $errors['zip_postal_code'] = <<<HTML
        ZIP/Postal Code must be less than or equal to 20 characters.
        Please try again.
      HTML;
    }

    // validate country
    $validateCountry = true;
    if (empty($this->country) || strlen($this->country) !== 2) {
      $validateCountry = false;
    } else {
      try {
        CountryAlpha2::from($this->country);
      } catch (\ValueError $e) {
        $validateCountry = false;
      }
    }
    if (!$validateCountry) {
      $errors['country'] = <<<HTML
        Country is required and must be a valid 2-letter country code.
        Please try again.
      HTML;
    }

    // validate extra
    if (
      !empty($this->extra)
      && strlen($this->extra) > 255
    ) {
      $errors['extra'] = <<<HTML
        Extra must be less than or equal to 255 characters.
        Please try again.
      HTML;
    }

    return $errors;
  }
}
