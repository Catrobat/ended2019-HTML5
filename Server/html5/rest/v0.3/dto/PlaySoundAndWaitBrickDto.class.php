<?php

class PlaySoundAndWaitBrickDto extends BaseBrickDto {

    public $resourceId;

    public function __construct($resourceId, $commentedOut = false) {
        parent::__construct("PlaySoundAndWait", $commentedOut);

        $this->resourceId = $resourceId;
    }
}
