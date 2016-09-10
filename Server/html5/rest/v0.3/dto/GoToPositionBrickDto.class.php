<?php

class GoToPositionBrickDto extends BaseBrickDto {

  public $x;		//FormulaDto
  public $y;		//FormulaDto
  
  public function __construct($x, $y) {
	parent::__construct("GoToPosition");
	$this->x = $x;
	$this->y = $y;
  }
  
}
