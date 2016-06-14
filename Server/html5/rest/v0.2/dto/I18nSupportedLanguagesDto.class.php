<?php

class I18nSupportedLanguagesDto
{
  public $supportedLanguages;

  public function __construct($list)
  {
    $this->supportedLanguages = $list;
  }
}
