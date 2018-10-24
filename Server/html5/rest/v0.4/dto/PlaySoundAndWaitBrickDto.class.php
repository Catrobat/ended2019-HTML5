<?php

class PlaySoundAndWaitBrickDto extends PlaySoundBrickDto {

    public function __construct($resourceId, $commentedOut = false) {
        parent::__construct($resourceId, $commentedOut);

        $this->type = "PlaySoundAndWait";
    }
}
