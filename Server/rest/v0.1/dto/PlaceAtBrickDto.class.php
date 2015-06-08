<?php

class PlaceAtBrickDto extends BaseBrickDto {

  public $x;	//FormulaDto
  public $y;	//FormulaDto

  
  public function __construct($x, $y) {
	parent::__construct("PlaceAt");
	
	$this->x = $x;
	$this->y = $y;
  }
  
}
