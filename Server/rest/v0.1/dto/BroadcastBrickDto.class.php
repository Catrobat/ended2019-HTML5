<?php

class BroadcastBrickDto extends BaseBrickDto {

  public $broadcastMsgId;
  
  
  public function __construct($broadcastMsgId) {
	parent::__construct("Broadcast");

	$this->broadcastMsgId = $broadcastMsgId;
  }
  
}

?>