<?php

declare(strict_types=1);

namespace RmsyMe\Decorators;

use Relnaggar\Veloz\Decorators\DecoratorInterface;
use RmsyMe\Services\Media;

/**
 * Decorator to add the media root to the template vars.
 */
class MediaRoot implements DecoratorInterface
{
  private Media $mediaService;

  public function __construct(Media $mediaService)
  {
    $this->mediaService = $mediaService;
  }

  public function getNewTemplateVars(array $templateVars): array
  {
    $newTemplateVars['mediaRoot'] = $this->mediaService->getMediaRoot();
    return $newTemplateVars;
  }
}
