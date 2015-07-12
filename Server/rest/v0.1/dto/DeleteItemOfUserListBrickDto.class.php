<?php

class DeleteItemOfUserListBrickDto extends BaseBrickDto
{
  public $referenceId;
  public $index;  //type of FormulaDto

  public function __construct($referenceId, $index)
  {
    parent::__construct("DeleteItemOfUserList");

    $this->referenceId = $referenceId;
    $this->index = $index;
  }
}
