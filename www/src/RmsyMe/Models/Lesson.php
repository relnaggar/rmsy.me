<?php

declare(strict_types=1);

namespace RmsyMe\Models;

class Lesson
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
}
