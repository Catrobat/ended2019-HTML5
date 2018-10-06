<?php

class ScriptBlockDto extends BaseBrickDto {

    public $id;
    //public $x;    //properties x and y were introduced to get a scratch compatible file (positions of bricks on screen)
    //public $y;
    public $bricks = array();

    public function __construct($type, $id, $commentedOut) {    //, $x = null, $y = null) {
        parent::__construct($type, $commentedOut);

        $this->id = $id;
        //$this->x = $x;
        //$this->y = $y;
    }
}
