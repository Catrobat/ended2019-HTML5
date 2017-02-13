<?php

class SetDirectionToBrickDto extends BaseBrickDto {

    public $pointer = true;	//default
    public $spriteId;			//use either pointer (mouse or last tab) or spriteId to point to

    public function __construct($spriteId = null, $commentedOut = false) {
        parent::__construct("SetDirectionTo", $commentedOut);

        if ($spriteId != null) {
            $this->pointer = false;
            $this->spriteId = $spriteId;
        }
    }
}
