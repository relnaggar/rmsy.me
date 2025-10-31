<?php

declare(strict_types=1);

namespace RmsyMe\Data;

class Payer
{
  public readonly string $id;
  public readonly string $name;
  public readonly ?string $address1;
  public readonly ?string $address2;
  public readonly ?string $address3;
  public readonly ?string $town_city;
  public readonly ?string $state_province_county;
  public readonly ?string $zip_postal_code;
  public readonly string $country;
  public readonly ?string $extra;
}
