<?php

declare(strict_types=1);

namespace RmsyMe\Models;

use DateTime;

class PaymentModel
{
  public readonly string $id;
  public readonly string $datetime;
  public readonly int $amount_gbp_pence;
  public readonly string $currency;
  public readonly string $payment_reference;
  public readonly string $buyer_id;
  public readonly ?string $sequence_number;

  public function getDate(): string
  {
    $dateTime = new DateTime($this->datetime);
    return $dateTime->format('Y-m-d');
  }

  public function getFormattedAmount(): string
  {
    return number_format($this->amount_gbp_pence / 100, 2) . ' '
      . strtoupper($this->currency);
  }

  public function getYear(): string
  {
    $dateTime = new DateTime($this->datetime);
    return $dateTime->format('Y');
  }

  public function getInvoiceNumber(): string
  {
    if ($this->sequence_number === null) {
      $error_message = 'No sequence number for payment ' . $this->id;
      error_log($error_message);
      throw new \RuntimeException($error_message);
    }
    return $this->getYear() . '-' . $this->sequence_number;
  }
}
