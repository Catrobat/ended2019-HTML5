<?php

class ChangeVariableBrickDto extends BaseBrickDto {

  public $referenceId;
  public $value;	//type of FormulaDto
  
  public function __construct($referenceId, $value) {
	parent::__construct("ChangeVariable");

	$this->referenceId = $referenceId;
	$this->value = $value;
  }
  
}
