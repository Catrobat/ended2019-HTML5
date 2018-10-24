<?php

class BroadcastBrickDto extends BaseBrickDto {

    public $msgId;

    public function __construct($msgId, $commentedOut = false) {
        parent::__construct("Broadcast", $commentedOut);

        $this->msgId = $msgId;
    }
}
