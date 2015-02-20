<?php

class GoBackBrickDto extends BaseBrickDto {

  public $layers;	//FormulaDto

  
  public function __construct($layers) {
	parent::__construct("GoBack");
	
	$this->layers = $layers;
  }
  
}

?>