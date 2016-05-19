<?php

class PointInDirectionBrickDto extends BaseBrickDto {

  public $degrees;	//FormulaDto

  
  public function __construct($degrees) {
	parent::__construct("PointInDirection");
	
	$this->degrees = $degrees;
  }
  
}
