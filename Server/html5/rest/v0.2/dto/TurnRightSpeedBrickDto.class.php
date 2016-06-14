<?php

class TurnRightSpeedBrickDto extends BaseBrickDto {

  public $degreesPerSec;	//FormulaDto
  
  public function __construct($degreesPerSec) {
	parent::__construct("TurnRightSpeed");
	
	$this->degreesPerSec = $degreesPerSec;
  }
  
}
