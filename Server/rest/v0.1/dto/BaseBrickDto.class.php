<?php

class BaseBrickDto
{
  public $type;

  public function __construct($type)
  {
    $this->type = $type;
  }
}
