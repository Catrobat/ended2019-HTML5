<?php

class PenUpBrickDto extends BaseBrickDto {

    public function __construct($commentedOut = false) {
        parent::__construct("PenUp", $commentedOut);
    }
}
