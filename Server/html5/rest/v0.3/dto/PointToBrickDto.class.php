<?php

class PointToBrickDto extends BaseBrickDto {

  public $pointer = true;	//default
  public $spriteId;			//use either pointer (mouse or last tab) or spriteId to point to
  
  public function __construct($spriteId = null) {
	parent::__construct("PointTo");
	
	if ($spriteId != null) {
	  $this->pointer = false;
	  $this->spriteId = $spriteId;
	}
  }
  
}
