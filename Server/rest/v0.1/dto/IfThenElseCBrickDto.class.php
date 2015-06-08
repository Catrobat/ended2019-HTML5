<?php

class IfThenElseCBrickDto extends BaseBrickDto {

  public $condition;	//type of FormulaDto

  public $ifBricks = array();	//inner scripts: if block
  public $elseBricks = array();	//inner scripts: else block
  
  
  public function __construct($condition) {
	parent::__construct("IfThenElse");
	$this->condition = $condition;
  }
  
}
