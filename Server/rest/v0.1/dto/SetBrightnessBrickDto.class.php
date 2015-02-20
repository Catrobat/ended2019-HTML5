<?php

class SetBrightnessBrickDto extends BaseBrickDto {

  public $percentage;	//type of FormulaDto
  
  
  public function __construct($percentage) {
	parent::__construct("SetBrightness");

	$this->percentage = $percentage;
  }

}

?>