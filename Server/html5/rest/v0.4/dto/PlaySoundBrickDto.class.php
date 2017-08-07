<?php

class PlaySoundBrickDto extends BaseBrickDto {

    public $resourceId;
    public $andWait = false;

    public function __construct($resourceId, $andWait = false, $commentedOut = false) {
        parent::__construct("PlaySound", $commentedOut);

        $this->resourceId = $resourceId;
        $this->andWait = $andWait;
    }
}
