<?php

class TurnRightBrickDto extends BaseBrickDto {

  public $degrees;	//FormulaDto

  
  public function __construct($degrees) {
	parent::__construct("TurnRight");
	
	$this->degrees = $degrees;
  }
  
}

?>