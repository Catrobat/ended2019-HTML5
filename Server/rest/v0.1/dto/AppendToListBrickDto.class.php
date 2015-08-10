<?php

include_once "BaseBrickDto.class.php";

class AppendToListBrickDto extends BaseBrickDto
{
  public $referenceId;
  public $value;  //type of FormulaDto

  public function __construct($referenceId, $value)
  {
    parent::__construct("AppendToList");

    $this->referenceId = $referenceId;
    $this->value = $value;
  }
}
