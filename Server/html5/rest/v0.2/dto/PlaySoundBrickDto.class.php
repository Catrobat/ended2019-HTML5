<?php

class PlaySoundBrickDto extends BaseBrickDto {

  public $resourceId;
  
  
  public function __construct($resourceId) {
	parent::__construct("PlaySound");

	$this->resourceId = $resourceId;
  }
  
}
