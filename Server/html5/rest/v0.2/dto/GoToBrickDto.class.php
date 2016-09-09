<?php

class GoToBrickDto extends BaseBrickDto {

  public $destinationType; //"mousePointer", "random", "sprite"
  public $spriteId;
  
  public function __construct($destinationType, $spriteId = null) {
	parent::__construct("GoTo");
	$this->destinationType = $destinationType;
	$this->spriteId = $spriteId;
  }
  
}
