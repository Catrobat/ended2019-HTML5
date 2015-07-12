<?php

class InsertItemIntoUserListBrickDto extends BaseBrickDto
{
  public $referenceId;
  public $index;
  public $value;  //type of FormulaDto

  public function __construct($referenceId, $index, $value)
  {
    parent::__construct("InsertItemIntoUserList");

    $this->referenceId = $referenceId;
    $this->index = $index;
    $this->value = $value;
  }
}
