<?php

class RotationSpeedRightBrickDto extends BaseBrickDto {

  public $degreesPerSec;	//FormulaDto
  
  public function __construct($degreesPerSec) {
	parent::__construct("RotationSpeedRight");
	
	$this->degreesPerSec = $degreesPerSec;
  }
  
}
