<?php

class SetVariableBrickDto extends BaseBrickDto {

  public $referenceId;
  public $value;	//type of FormulaDto
  
  public function __construct($referenceId, $value) {
	parent::__construct("SetVariable");

	$this->referenceId = $referenceId;
	$this->value = $value;
  }
  
}
