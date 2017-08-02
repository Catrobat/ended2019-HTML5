<?php

class ComeToFrontBrickDto extends BaseBrickDto {

    public function __construct($commentedOut = false) {
        parent::__construct("ComeToFront", $commentedOut);
    }
}
