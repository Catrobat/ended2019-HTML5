<?php

class ShowVariableBrickDto extends BaseBrickDto
{
  public $referenceId;
  public $x;	//FormulaDto
  public $y;	//FormulaDto

  public function __construct($referenceId, $x, $y)
  {
    parent::__construct("ShowVariable");

    $this->referenceId = $referenceId;
    $this->x = $x;
    $this->y = $y;
  }
}
