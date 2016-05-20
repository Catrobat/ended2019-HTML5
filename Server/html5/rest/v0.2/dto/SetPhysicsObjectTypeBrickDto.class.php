<?php

class SetPhysicsObjectTypeBrickDto extends BaseBrickDto {

  public $type;	//"DYNAMIC", "FIXED", "NONE"
  
  public function __construct($type) {
	parent::__construct("SetPhysicsObjectType");
	
	$this->type = $type;
  }
  
}
