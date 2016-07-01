<?php

class WhenBroadcastReceiveBrickDto extends ScriptBlockDto {

    public $receiveMsgId;	//id of projects broadcasts

    public function __construct($id, $receiveMsgId) {
        parent::__construct("WhenBroadcastReceive", $id);

        $this->receiveMsgId = $receiveMsgId;
    }

}
