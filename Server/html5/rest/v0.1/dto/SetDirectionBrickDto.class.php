<?php

class SetDirectionBrickDto extends BaseBrickDto {

  public $degrees;	//FormulaDto

  
  public function __construct($degrees) {
	parent::__construct("SetDirection");
	
	$this->degrees = $degrees;
  }
  
}
