<?php

class StopScriptDto extends BaseBrickDto {

  public $value;	//all, this, otherScriptsInSprite

  
  public function __construct($value) {
	parent::__construct("StopScript");
	
	$this->value = $value;
  }
  
}
