<?php

class PlaySoundBrickDto extends BaseBrickDto {

  public $soundId;
  
  
  public function __construct($soundId) {
	parent::__construct("PlaySound");

	$this->soundId = $soundId;
  }
  
}

?>