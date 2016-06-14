<?php

class ScriptBlockDto extends BaseBrickDto {

    public $x = array();
    public $y = null;
    public $bricks = null;	//inner scripts


    public function __construct($type, $bricks = array(), $x = null, $y = null) {
        parent::__construct($type);
        $this->bricks = $bricks;
        $this->x = $x;
        $this->y = $y;
    }

}
