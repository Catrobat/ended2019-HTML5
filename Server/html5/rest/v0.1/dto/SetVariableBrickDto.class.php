<?php

class SetVariableBrickDto extends BaseBrickDto {

  public $referenceId;
  public $value;	//type of FormulaDto
  public $init;	//bool: indicates if variabled was defined in this brick and therefore has an initialization value
  
  public function __construct($referenceId, $value, $init) {
	parent::__construct("SetVariable");

	$this->referenceId = $referenceId;
	$this->value = $value;
	$this->init = $init;
  }
  
}
