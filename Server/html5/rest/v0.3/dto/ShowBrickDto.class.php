<?php

class ShowBrickDto extends BaseBrickDto {

    public function __construct($commentedOut = false) {
        parent::__construct("Show", $commentedOut);
    }
}
