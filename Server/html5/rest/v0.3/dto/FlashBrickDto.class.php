<?php

class FlashBrickDto extends BaseBrickDto {

    public $selected;   //index

    public function __construct($selected = "0", $commentedOut = false) {
        parent::__construct("Flash", $commentedOut);

        $this->selected = $selected;	//{0: off, 1: on}
    }
}
