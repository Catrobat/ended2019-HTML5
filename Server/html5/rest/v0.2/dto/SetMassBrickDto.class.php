<?php

class SetMassBrickDto extends BaseBrickDto {

  public $value;	//FormulaDto

  
  public function __construct($value) {
	parent::__construct("SetMass");
	
	$this->value = $value;
  }
  
}
