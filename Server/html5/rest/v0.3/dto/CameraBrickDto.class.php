<?php

class CameraBrickDto extends BaseBrickDto {

    public $selected;   //index

    public function __construct($selected = "0", $commentedOut = false) {
        parent::__construct("Camera", $commentedOut);

        $this->selected = $selected;	//{0: off, 1: on}
    }
}
