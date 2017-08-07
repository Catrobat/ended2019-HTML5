<?php

class WhenBroadcastReceiveBrickDto extends ScriptBlockDto {

    public $receiveMsgId;	//id of projects broadcasts

    public function __construct($id, $receiveMsgId, $commentedOut = false) {
        parent::__construct("WhenBroadcastReceive", $id, $commentedOut);

        $this->receiveMsgId = $receiveMsgId;
    }
}
