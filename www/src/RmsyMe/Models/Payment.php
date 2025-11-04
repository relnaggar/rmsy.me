<?php

declare(strict_types=1);

namespace RmsyMe\Models;

use DateTime;

class Payment
{
  public readonly string $id;
  public readonly string $datetime;
  public readonly int $amount; // in pence / cents
  public readonly string $currency;
  public readonly string $payment_reference;
  public readonly string $payer_id;

  public function getDate(): string
  {
    $dateTime = new DateTime($this->datetime);
    return $dateTime->format('Y-m-d');
  }

  public function getFormattedAmount(): string
  {
    return number_format($this->amount / 100, 2) . ' '
      . strtoupper($this->currency);
  }
}
