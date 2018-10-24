<?php

class PlaySoundBrickDto extends BaseBrickDto {

    public $resourceId;

    public function __construct($resourceId, $commentedOut = false) {
        parent::__construct("PlaySound", $commentedOut);

        $this->resourceId = $resourceId;
    }
}
