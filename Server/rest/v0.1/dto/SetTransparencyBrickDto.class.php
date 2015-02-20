<?php
//SetGhostEffect

class SetTransparencyBrickDto extends BaseBrickDto {

  public $percentage;	//type of FormulaDto
  
  
  public function __construct($percentage) {
	parent::__construct("SetTransparency");

	$this->percentage = $percentage;
  }

}

?>