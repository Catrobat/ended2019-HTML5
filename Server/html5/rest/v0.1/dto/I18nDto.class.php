<?php

class I18nDto
{
  public $languageCode;
  public $direction;
  public $dictionary;

  public function __construct($langCode, $dir, $dict)
  {
    $this->languageCode = $langCode;
    $this->direction = $dir;
    $this->dictionary = $dict;
  }
}
