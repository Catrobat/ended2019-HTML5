<?php

class BroadcastAndWaitBrickDto extends BaseBrickDto {

    public $broadcastMsgId;


    public function __construct($broadcastMsgId, $commentedOut = false) {
        parent::__construct("BroadcastAndWait", $commentedOut);

        $this->broadcastMsgId = $broadcastMsgId;
    }

}
