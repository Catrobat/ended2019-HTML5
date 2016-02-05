<?php

class SupportedLanguagesDto
{
  public $supportedLanguages;

  public function __construct($list)
  {
    $this->supportedLanguages = $list;
  }
}
