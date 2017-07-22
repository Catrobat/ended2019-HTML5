<?php

class StopAllSoundsBrickDto extends BaseBrickDto {

    public function __construct($commentedOut = false) {
        parent::__construct("StopAllSounds", $commentedOut);
    }
}
