<?php

class ClearBackgroundBrickDto extends BaseBrickDto {

    public function __construct($commentedOut = false) {
        parent::__construct("ClearBackground", $commentedOut);
    }
}
