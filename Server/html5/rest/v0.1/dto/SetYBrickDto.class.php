<?php

class SetYBrickDto extends BaseBrickDto {

  public $value;	//FormulaDto

  
  public function __construct($value) {
	parent::__construct("SetY");
	
	$this->value = $value;
  }
  
}
