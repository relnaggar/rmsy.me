<?php

declare(strict_types=1);

namespace RmsyMe\Models;

use DateTime;

class LessonModel
{
  public readonly int $id;
  public readonly string $description;
  public readonly string $datetime;
  public readonly int $duration_minutes;
  public readonly int $repeat_weeks;
  public readonly int $price_gbp_pence;
  public readonly bool $paid;
  public readonly ?int $student_id;
  public readonly ?int $client_id;
  public readonly ?string $buyer_id;

  public function getDate(): string
  {
    $dt = new DateTime($this->datetime);
    return $dt->format('Y-m-d');
  }

  public function getDayDate(): string
  {
    $dt = new DateTime($this->datetime);
    return $dt->format('l jS F Y');
  }

  public function getStartTime(): string
  {
    $dt = new DateTime($this->datetime);
    return $dt->format('H:i');
  }

  public function getEndTime(): string
  {
    $dt = new \DateTime($this->datetime);
    $dt->modify("+{$this->duration_minutes} minutes");
    return $dt->format('H:i');
  }

  public function getFullTime(): string
  {
    return $this->getStartTime() . ' - ' . $this->getEndTime();
  }

  public function getPriceGbp(): string
  {
    return number_format($this->price_gbp_pence / 100, 2);
  }
}
