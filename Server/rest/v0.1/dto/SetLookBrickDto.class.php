<?php

class SetLookBrickDto extends BaseBrickDto {

  public $id;
  
  
  public function __construct($imageId) {
	parent::__construct("SetLook");

	$this->imageId = $imageId;
  }
  
}
