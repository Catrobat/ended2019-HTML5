<?php

class ChangeXBrickDto extends BaseBrickDto {

  public $value;	//type of FormulaDto
  
  
  public function __construct($value) {
	parent::__construct("ChangeX");

	$this->value = $value;
  }

}
