<?php

class I18nDeDto extends I18nBaseDto
{
  public function __construct()
  {
    $this->lang = "Deutsch";

    $this->back = "Zurück";
    $this->restart = "Neustart";
    $this->resume = "Fortsetzen";
    $this->preview = "Vorschau";
    $this->axesOn = "Axen An";
    $this->axesOff = "Axen Aus";
  }
}
