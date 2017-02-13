<?php

class SceneDto {

    public $groupId;
    public $id;
    public $name;
    public $screenHeight;
    public $screenWidth;

    public $background;			//object
    public $spriteGroups = array();   //objects
    public $sprites = array();	//objects

    public function __construct($id, $name, $screenWidth, $screenHeight) {
        $this->id = $id;
        $this->name = $name;
        $this->screenWidth = $screenWidth;
        $this->screenHeight = $screenHeight;
    }
}
