<?php

class SetLookBrickDto extends BaseBrickDto {

    public $lookId;

    public function __construct($lookId, $commentedOut = false) {
        parent::__construct("SetLook", $commentedOut);

        $this->lookId = $lookId;
    }
}
