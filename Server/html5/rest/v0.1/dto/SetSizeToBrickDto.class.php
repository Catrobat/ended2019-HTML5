<?php

class SetSizeBrickDto extends BaseBrickDto {

  public $percentage;	//FormulaDto

  
  public function __construct($percentage) {
	parent::__construct("SetSize");
	
	$this->percentage = $percentage;
  }
  
}
