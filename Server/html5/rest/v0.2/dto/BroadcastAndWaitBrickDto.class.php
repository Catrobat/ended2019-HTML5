<?php

class BroadcastAndWaitBrickDto extends BaseBrickDto {

  public $broadcastMsgId;
  
  
  public function __construct($broadcastMsgId) {
	parent::__construct("BroadcastAndWait");

	$this->broadcastMsgId = $broadcastMsgId;
  }
  
}
