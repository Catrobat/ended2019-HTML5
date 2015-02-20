<?php

class ChangeBrightnessBrickDto extends BaseBrickDto {

  public $value;	//type of FormulaDto
  
  
  public function __construct($value) {
	parent::__construct("ChangeBrightness");

	$this->value = $value;
  }

}

?>