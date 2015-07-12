<?php

class ReplaceItemInUserListBrickDto extends BaseBrickDto
{
  public $referenceId;
  public $value;  //type of FormulaDto
  public $index;

  public function __construct($referenceId, $value, $index)
  {
    parent::__construct("ReplaceItemInUserList");

    $this->referenceId = $referenceId;
    $this->value = $value;
    $this->index = $index;
  }
}
