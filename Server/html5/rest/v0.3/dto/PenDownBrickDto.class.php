<?php

class PenDownBrickDto extends BaseBrickDto {

    public function __construct($commentedOut = false) {
        parent::__construct("PenDown", $commentedOut);
    }
}
