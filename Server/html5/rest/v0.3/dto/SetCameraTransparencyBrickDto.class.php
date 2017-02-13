<?php

class SetCameraTransparencyBrickDto extends BaseBrickDto {

    public $value;   //index

    public function __construct($value = "0", $commentedOut = false) {
        parent::__construct("SetCameraTransparency", $commentedOut);

        $this->value = $value;
    }
}
