<?php
//ChangeGhostEffect

class ChangeTransparencyBrickDto extends BaseBrickDto {

  public $value;	//type of FormulaDto
  
  
  public function __construct($value) {
	parent::__construct("ChangeTransparency");

	$this->value = $value;
  }

}

?>