<?php

class SetCameraTransparencyBrickDto extends BaseBrickDto {

    public $transparency;   //index
  
    public function __construct($transparency = "0") {
        parent::__construct("SetCameraTransparency");

        $this->transparency = $transparency;
    }
}
