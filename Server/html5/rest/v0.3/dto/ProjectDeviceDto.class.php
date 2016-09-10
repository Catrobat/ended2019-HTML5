<?php

class ProjectDeviceDto {

    //public $name;
    //public $platform;
    //public $platformVersion;

    public $screenHeight;
    public $screenWidth;
    public $screenMode;


    public function __construct(/*$name, $platform, $platformVersion, */$screenHeight, $screenWidth, $screenMode) {
        //$this->name = $name;
        //$this->platform = $platform;
        //$this->platformVersion = $platformVersion;
        $this->screenHeight = $screenHeight;
        $this->screenWidth = $screenWidth;
        $this->screenMode = $screenMode;
    }

}
