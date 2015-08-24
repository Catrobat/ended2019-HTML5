<?php

class ChangeSizeBrickDto extends BaseBrickDto {

  public $value;	//type of FormulaDto
  
  
  public function __construct($value) {
	parent::__construct("ChangeSize");

	$this->value = $value;
  }

}
