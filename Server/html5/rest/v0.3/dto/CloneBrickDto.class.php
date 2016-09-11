<?php

class CloneBrickDto extends BaseBrickDto {

    public function __construct($commentedOut = false) {
        parent::__construct("Clone", $commentedOut);
    }
}
