<?php

class WhenCollisionBrickDto extends ScriptBlockDto {

  public $any = true;
  public $spriteId;
  
  public function __construct($spriteId = null) {
	parent::__construct("WhenCollision");
	if ($spriteId != null) {
	  $this->any = false;
	  $this->spriteId = $spriteId;
	}
  }
  
}
