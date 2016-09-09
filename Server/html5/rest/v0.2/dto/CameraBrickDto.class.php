<?php

class CameraBrickDto extends BaseBrickDto {

    public $selected;   //index
  
    public function __construct($selected = "0") {
        parent::__construct("Camera");

        $this->selected = $selected;	//{0: off, 1: on}
    }
}
