<?php

class SetBounceFactorBrickDto extends BaseBrickDto {

  public $percentage;	//FormulaDto

  
  public function __construct($percentage) {
	parent::__construct("SetBounceFactor");
	
	$this->percentage = $percentage;
  }
  
}
