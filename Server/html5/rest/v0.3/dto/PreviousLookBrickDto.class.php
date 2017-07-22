<?php

class PreviousLookBrickDto extends BaseBrickDto {

    public function __construct($commentedOut = false) {
        parent::__construct("PreviousLook", $commentedOut);
    }
}
