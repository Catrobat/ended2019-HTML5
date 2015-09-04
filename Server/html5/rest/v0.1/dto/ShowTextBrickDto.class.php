<?php

class ShowTextBrickDto extends BaseBrickDto {

  public $referenceId;
  public $x;	//FormulaDto
  public $y;	//FormulaDto
  
  public function __construct($referenceId, $x, $y) {
	parent::__construct("ShowText");

	$this->referenceId = $referenceId;
	$this->x = $x;
	$this->y = $y;
  }
  
}
