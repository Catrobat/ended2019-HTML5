<?php

class SetCameraTransparencyBrickDto extends BaseBrickDto {

    public $value;   //index
  
    public function __construct($value = "0") {
        parent::__construct("SetCameraTransparency");

        $this->value = $value;
    }
}
