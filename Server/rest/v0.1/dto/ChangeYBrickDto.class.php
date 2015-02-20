<?php

class ChangeYBrickDto extends BaseBrickDto {

  public $value;	//type of FormulaDto
  
  
  public function __construct($value) {
	parent::__construct("ChangeY");

	$this->value = $value;
  }

}

?>