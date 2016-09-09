<?php

class RepeatUntilBrickDto extends BaseBrickDto {

  public $condition;	//formula
  public $bricks = array();	//inner scripts
  
  
  public function __construct($condition) {
	parent::__construct("RepeatUntil");
	
	$this->condition = $condition;
  }
  
}
