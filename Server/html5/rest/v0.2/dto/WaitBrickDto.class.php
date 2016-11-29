<?php

class WaitBrickDto extends BaseBrickDto {

  public $duration;	//type of FormulaDto
  
  public function __construct($duration) {
	parent::__construct("Wait");

	$this->duration = $duration;
  }
  
}
