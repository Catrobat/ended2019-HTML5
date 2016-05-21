<?php

class SetLookBrickDto extends BaseBrickDto {

    public $lookId;

    public function __construct($lookId) {
        parent::__construct("SetLook");

        $this->lookId = $lookId;
    }

}
