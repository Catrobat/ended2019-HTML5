<?php

class SetDirectionToBrickDto extends BaseBrickDto {

  public $spriteId;
  
  public function __construct($spriteId) {
	parent::__construct("SetDirectionTo");
	
	$this->spriteId = $spriteId;
  }
  
}
