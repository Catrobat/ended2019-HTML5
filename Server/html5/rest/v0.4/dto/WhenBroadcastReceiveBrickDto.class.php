<?php

class WhenBroadcastReceiveBrickDto extends ScriptBlockDto {

    public $msgId;	//id of projects broadcasts

    public function __construct($id, $msgId, $commentedOut = false) {
        parent::__construct("WhenBroadcastReceive", $id, $commentedOut);

        $this->msgId = $msgId;
    }
}
