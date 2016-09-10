<?php

class SceneDto {

    public $id;
    public $name;
    public $screenHeight;
    public $screenWidth;

    public $background;			//object
    public $sprites = array();	//objects

    public function __construct($id, $name, $screenHeight, $screenWidth) {
        $this->id = $id;
        $this->name = $name;
        $this->screenHeight = $screenHeight;
        $this->screenWidth = $screenWidth;
    }
}
