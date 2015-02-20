<?php

class GlideToBrickDto extends BaseBrickDto {

  public $x;		//FormulaDto
  public $y;		//FormulaDto
  public $duration;	//FormulaDto

  
  public function __construct($x, $y, $duration) {
	parent::__construct("GlideTo");
	
	$this->x = $x;
	$this->y = $y;
	$this->duration = $duration;
  }
  
}

?>