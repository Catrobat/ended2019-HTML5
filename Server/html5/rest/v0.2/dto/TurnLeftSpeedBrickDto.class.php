<?php

class TurnLeftSpeedBrickDto extends BaseBrickDto {

  public $degreesPerSec;	//FormulaDto
  
  public function __construct($degreesPerSec) {
	parent::__construct("TurnLeftSpeed");
	
	$this->degreesPerSec = $degreesPerSec;
  }
  
}
