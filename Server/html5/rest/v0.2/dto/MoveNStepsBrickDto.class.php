<?php

class MoveNStepsBrickDto extends BaseBrickDto {

  public $steps;	//FormulaDto

  
  public function __construct($steps) {
	parent::__construct("MoveNSteps");
	
	$this->steps = $steps;
  }
  
}
