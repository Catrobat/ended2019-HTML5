<?php

class SetVelocityBrickDto extends BaseBrickDto {

  public $x;		//FormulaDto
  public $y;		//FormulaDto
  
  public function __construct($x, $y) {
	parent::__construct("SetVelocity");
	$this->x = $x;
	$this->y = $y;
  }
  
}
