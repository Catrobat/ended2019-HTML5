<?php

class CloneBrickDto extends BaseBrickDto {

    public $spriteId;

    public function __construct($spriteId, $commentedOut = false) {
        parent::__construct("Clone", $commentedOut);

        $this->spriteId = $spriteId;
    }
}
