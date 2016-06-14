<?php

class WaitUntilBrickDto extends BaseBrickDto {

  public $condition;	//formula
  
  public function __construct($condition) {
	parent::__construct("WaitUntil");
	
	$this->condition = $condition;
  }
  
}
