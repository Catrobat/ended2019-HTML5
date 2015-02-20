<?php

class SetSizeToBrickDto extends BaseBrickDto {

  public $percentage;	//FormulaDto

  
  public function __construct($percentage) {
	parent::__construct("SetSizeTo");
	
	$this->percentage = $percentage;
  }
  
}

?>