<?php

class SelectCameraBrickDto extends BaseBrickDto {

    public $selected;   //index

    public function __construct($selected = "0", $commentedOut = false) {
        parent::__construct("SelectCamera", $commentedOut);

        $this->selected = $selected;	//{0: back, 1: front}
    }
}
