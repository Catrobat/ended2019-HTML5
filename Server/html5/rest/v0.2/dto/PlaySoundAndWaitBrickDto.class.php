<?php

class PlaySoundAndWaitBrickDto extends BaseBrickDto {

  public $resourceId;


  public function __construct($resourceId) {
      parent::__construct("PlaySoundAndWait");

	$this->resourceId = $resourceId;
  }

}
