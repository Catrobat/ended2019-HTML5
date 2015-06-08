<?php

class PointToBrickDto extends BaseBrickDto {

  public $spriteId;
  
  public function __construct($spriteId) {
	parent::__construct("PointTo");
	
	$this->spriteId = $spriteId;
  }
  
}
