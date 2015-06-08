<?php

class SetVolumeBrickDto extends BaseBrickDto {

  public $percentage;	//type of FormulaDto
  
  
  public function __construct($percentage) {
	parent::__construct("SetVolume");

	$this->percentage = $percentage;
  }
  
}
