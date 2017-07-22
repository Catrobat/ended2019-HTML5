<?php

class ResetTimerBrickDto extends BaseBrickDto {

    public function __construct($commentedOut = false) {
        parent::__construct("ResetTimer", $commentedOut);
    }
}
