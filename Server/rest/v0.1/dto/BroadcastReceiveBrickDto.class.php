<?php

class BroadcastReceiveBrickDto extends BaseBrickDto {

  public $receiveMsgId;	//id of projects broadcasts
  public $bricks = array();	//inner scripts
  
  
  public function __construct($receiveMsgId) {
	parent::__construct("BroadcastReceive");
    
    $this->receiveMsgId = $receiveMsgId;
  }
  
}

?>