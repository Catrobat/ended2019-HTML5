<?php

class ReplaceAtListBrickDto extends BaseBrickDto
{
  public $referenceId;
  public $value;  //type of FormulaDto
  public $index;

  public function __construct($referenceId, $index, $value)
  {
    parent::__construct("ReplaceAtList");

    $this->referenceId = $referenceId;
    $this->index = $index;
    $this->value = $value;
  }
}
