<?php

class BroadcastBrickDto extends BaseBrickDto {

    public $broadcastId;
    public $andWait = false;

    public function __construct($broadcastId, $andWait = false, $commentedOut = false) {
        parent::__construct("Broadcast", $commentedOut);

        $this->broadcastId = $broadcastId;
        $this->andWait = $andWait;
    }
}
