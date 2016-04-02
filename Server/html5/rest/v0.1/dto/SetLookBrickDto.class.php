<?php

class SetLookBrickDto extends BaseBrickDto {

  public $imageId;
  
  
  public function __construct($imageId) {
	parent::__construct("SetLook");

	$this->imageId = $imageId;
  }
  
}
