<?php

class CloneBrickDto extends BaseBrickDto {

    public $ofMyself = false;
    public $spriteId;

    public function __construct($commentedOut = false) {
        parent::__construct("Clone", $commentedOut);

    }
}
