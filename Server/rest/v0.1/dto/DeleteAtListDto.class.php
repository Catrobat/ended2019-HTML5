<?php

class DeleteAtListDto extends BaseBrickDto
{
  public $referenceId;
  public $index;  //type of FormulaDto

  public function __construct($referenceId, $index)
  {
    parent::__construct("DeleteAtList");

    $this->referenceId = $referenceId;
    $this->index = $index;
  }
}
