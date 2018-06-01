<?php

class InsertAtListBrickDto extends BaseBrickDto
{
  public $referenceId;
  public $index;  //type of FormulaDto
  public $value;  //type of FormulaDto

  public function __construct($referenceId, $index, $value)
  {
    parent::__construct("InsertAtList");

    $this->referenceId = $referenceId;
    $this->index = $index;
    $this->value = $value;
  }
}
