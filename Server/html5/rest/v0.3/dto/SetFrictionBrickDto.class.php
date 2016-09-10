<?php

class SetFrictionBrickDto extends BaseBrickDto {

  public $percentage;	//FormulaDto

  
  public function __construct($percentage) {
	parent::__construct("SetFriction");
	
	$this->percentage = $percentage;
  }
  
}
