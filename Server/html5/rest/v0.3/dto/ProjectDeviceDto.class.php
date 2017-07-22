<?php

class ProjectDeviceDto {

    public $screenHeight;
    public $screenWidth;
    public $screenMode;

    public function __construct($screenHeight, $screenWidth, $screenMode) {
        $this->screenHeight = $screenHeight;
        $this->screenWidth = $screenWidth;
        $this->screenMode = $screenMode;
    }
}
