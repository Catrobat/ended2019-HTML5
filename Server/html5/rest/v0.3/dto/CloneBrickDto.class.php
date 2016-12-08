<?php

class CloneBrickDto extends BaseBrickDto {  //TODO: Dino

    public $spriteId;

    public function __construct($spriteId, $commentedOut = false) {
        parent::__construct("Clone", $commentedOut);

        $this->spriteId = $spriteId;
    }
}
