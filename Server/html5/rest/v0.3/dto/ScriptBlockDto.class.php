<?php

class ScriptBlockDto extends BaseBrickDto {

    public $id;
    public $x = array();
    public $y = null;
    public $bricks = array();


    public function __construct($type, $id, $commentedOut, $x = null, $y = null) {
        parent::__construct($type, $commentedOut);

        $this->id = $id;
        $this->x = $x;
        $this->y = $y;
    }

}
