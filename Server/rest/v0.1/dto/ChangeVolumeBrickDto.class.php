<?php

class ChangeVolumeBrickDto extends BaseBrickDto {

  public $value;	//type of FormulaDto
  
  
  public function __construct($value) {
	parent::__construct("changeVolume");

	$this->value = $value;
  }
  
}

?>