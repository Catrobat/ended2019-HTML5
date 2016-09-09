<?php

class SetPhysicsObjectTypeBrickDto extends BaseBrickDto {

  public $physicsType;	//"DYNAMIC", "FIXED", "NONE"

  public function __construct($type) {
	parent::__construct("SetPhysicsObjectType");

	$this->physicsType = $type;
  }

}
