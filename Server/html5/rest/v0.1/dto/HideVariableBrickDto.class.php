<?php

class HideVariableBrickDto extends BaseBrickDto
{
  public $referenceId;

  public function __construct($referenceId)
  {
    parent::__construct("HideVariable");

    $this->referenceId = $referenceId;
  }
}
