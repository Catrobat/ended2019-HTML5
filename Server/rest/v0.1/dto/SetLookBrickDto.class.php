<?php

class SetLookBrickDto extends BaseBrickDto {

  public $id;
  
  
  public function __construct($id) {
	parent::__construct("SetLook");

	$this->id = $id;
  }
  
}

?>