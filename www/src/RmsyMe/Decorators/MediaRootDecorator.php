<?php

declare(strict_types=1);

namespace RmsyMe\Decorators;

use Relnaggar\Veloz\Decorators\DecoratorInterface;
use RmsyMe\Services\MediaService;

/**
 * Decorator to add the media root to the template vars.
 */
class MediaRootDecorator implements DecoratorInterface
{
  private MediaService $mediaService;

  public function __construct(MediaService $mediaService)
  {
    $this->mediaService = $mediaService;
  }

  public function getNewTemplateVars(array $templateVars): array
  {
    $newTemplateVars['mediaRoot'] = $this->mediaService->getMediaRoot();
    return $newTemplateVars;
  }
}
