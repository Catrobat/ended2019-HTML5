<?php

class SetBounceBrickDto extends BaseBrickDto {

  public $percentage;	//FormulaDto

  
  public function __construct($percentage) {
	parent::__construct("SetBounce");
	
	$this->percentage = $percentage;
  }
  
}
