<?php

class WhenBroadcastReceiveBrickDto extends ScriptBlockDto {

  public $receiveMsgId;	//id of projects broadcasts
  
  public function __construct($receiveMsgId) {
	parent::__construct("WhenBroadcastReceive");
    
    $this->receiveMsgId = $receiveMsgId;
  }
  
}
