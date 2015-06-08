<?php

class TurnLeftBrickDto extends BaseBrickDto {

  public $degrees;	//FormulaDto

  
  public function __construct($degrees) {
	parent::__construct("TurnLeft");
	
	$this->degrees = $degrees;
  }
  
}
