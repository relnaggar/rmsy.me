<?php

declare(strict_types=1);

namespace RmsyMe\Components;

use Framework\Components\ComponentInterface;

class FormInput implements ComponentInterface
{
  private readonly string $name;
  private readonly string $label;
  private readonly string $type;
  private readonly string $formName;
  private readonly string $autocomplete;
  private readonly string $extraAttributes;
  private readonly string $invalidFeedback;
  private readonly string $formText;
  private readonly bool $honeypot;

  public function __construct(
    string $name,
    string $label,
    string $type,
    string $formName,
    string $autocomplete,
    string $extraAttributes = '',
    string $invalidFeedback = '',
    string $formText = '',
    bool $honeypot = false,
  ) {
    $this->name = $name;
    $this->label = $label;
    $this->type = $type;
    $this->formName = $formName;
    $this->autocomplete = $autocomplete;
    $this->extraAttributes = $extraAttributes;
    $this->invalidFeedback = $invalidFeedback;
    $this->formText = $formText;
    $this->honeypot = $honeypot;
  }

  public function render(): string
  {
    ob_start();
    ?>
      <div class="
        mb-3
        <?= $this->honeypot ? 'subject' : '' ?>
      ">
        <label for="<?= $this->name ?>" class="col-form-label">
          <?= $this->label ?>
        </label>
        <?php if ($this->type === "textarea"): ?>
          <textarea
            class="form-control"
            id="<?= $this->name ?>"
            name="<?= $this->formName ?>[<?= $this->name ?>]"
            autocomplete="<?= $this->autocomplete ?>"
            <?= $this->extraAttributes ?>
          ><?= $_POST[$this->formName][$this->name] ?? '' ?></textarea>
        <?php else: // input ?>
          <input
            type="<?= $this->type ?>"
            class="form-control"
            id="<?= $this->name ?>"
            name="<?= $this->formName ?>[<?= $this->name ?>]"
            value="<?= $_POST[$this->formName][$this->name] ?? '' ?>"
            autocomplete="<?= $this->autocomplete ?>"
            <?= $this->extraAttributes ?>
          >
        <?php endif; ?>
        <?php if ($this->invalidFeedback): ?>
          <div class="invalid-feedback">
            <?= $this->invalidFeedback ?>
          </div>
        <?php endif; ?>
        <?php if ($this->formText): ?>
          <div class="form-text">
            <?= $this->formText ?>
          </div>
        <?php endif; ?>
      </div>
    <?php
    return ob_get_clean();
  }
}
