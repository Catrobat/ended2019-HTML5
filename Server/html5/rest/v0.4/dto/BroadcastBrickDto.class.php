<?php

class BroadcastBrickDto extends BaseBrickDto {

    public $msgId;
    public $andWait = false;

    public function __construct($msgId, $andWait = false, $commentedOut = false) {
        parent::__construct("Broadcast", $commentedOut);

        $this->msgId = $msgId;
        $this->andWait = $andWait;
    }
}
