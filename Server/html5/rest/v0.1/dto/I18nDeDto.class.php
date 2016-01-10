<?php

class I18nDeDto extends I18nBaseDto
{
  public function __construct($region)
  {
    $this->lang = "de";
    $this->region = $region;
  }
}
