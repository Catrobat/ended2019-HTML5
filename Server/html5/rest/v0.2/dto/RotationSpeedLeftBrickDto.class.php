<?php

class RotationSpeedLeftBrickDto extends BaseBrickDto {

  public $degreesPerSec;	//FormulaDto
  
  public function __construct($degreesPerSec) {
	parent::__construct("RotationSpeedLeft");
	
	$this->degreesPerSec = $degreesPerSec;
  }
  
}
