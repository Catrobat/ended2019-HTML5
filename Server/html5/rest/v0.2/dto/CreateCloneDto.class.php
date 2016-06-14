<?php

class CreateCloneBrickDto extends BaseBrickDto {

  public $self;		//default
  public $spriteId;	//always use either ID or SELF
  
  public function __construct($spriteId = null) {
	parent::__construct("CreateClone");
	
	if ($spriteId != null) {
	  $this->self = false;
	  $this->spriteId = $spriteId;
	}
  }
  
}
