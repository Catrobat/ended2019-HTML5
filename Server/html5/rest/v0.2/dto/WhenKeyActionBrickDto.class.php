<?php

class WhenKeyActionBrickDto extends ScriptBlockDto {

  public $keyCode;
  
  public function __construct($keyCode) {
	parent::__construct("WhenKeyAction");
	$this->keyCode = $keyCode;	//"space", "up arrow", "down arrow", "right arrow", "left arrow", "any", "a" - "z", "0" - "9"
	
  }
  
}
