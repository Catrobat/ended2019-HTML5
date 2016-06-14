<?php

class WhenLookChangeToBrick extends ScriptBlockDto {

  public $spriteId;
  public $lookId;
  
  public function __construct($spriteId, $lookId) {
	parent::__construct("WhenLookChangeTo");
	$this->spriteId = $spriteId;
	$this->lookId = $lookId;
  }
  
}
