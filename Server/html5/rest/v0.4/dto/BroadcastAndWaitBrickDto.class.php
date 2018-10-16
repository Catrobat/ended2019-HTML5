<?php

class BroadcastAndWaitBrickDto extends BaseBrickDto {

    public $msgId;

    public function __construct($msgId, $commentedOut = false) {
        parent::__construct("BroadcastAndWait", $commentedOut);

        $this->msgId = $msgId;
    }
}
