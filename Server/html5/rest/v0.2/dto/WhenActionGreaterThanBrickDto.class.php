<?php

class WhenActionGreaterThanBrickDto extends ScriptBlockDto {

  public $value;
  //action: "video motion", "timer", "loudness"
  
  public function __construct($action, $value) {
	parent::__construct("WhenActionGreaterThan");
	$this->value = $value;
  }
  
}
