<?php

class BroadcastBrickDto extends BaseBrickDto {

    public $broadcastMsgId;


    public function __construct($broadcastMsgId, $commentedOut = false) {
        parent::__construct("Broadcast", $commentedOut);

        $this->broadcastMsgId = $broadcastMsgId;
    }

}
