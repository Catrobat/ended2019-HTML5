<?php

class SetXBrickDto extends BaseBrickDto {

  public $value;	//FormulaDto

  
  public function __construct($value) {
	parent::__construct("SetX");
	
	$this->value = $value;
  }
  
}
