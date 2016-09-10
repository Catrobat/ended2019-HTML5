<?php

class SetGravityBrickDto extends BaseBrickDto {

  public $x;		//FormulaDto
  public $y;		//FormulaDto
  
  public function __construct($x, $y) {
	parent::__construct("SetGravity");
	$this->x = $x;
	$this->y = $y;
  }
  
}
