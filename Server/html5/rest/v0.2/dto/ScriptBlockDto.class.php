<?php

class ScriptBlockDto extends BaseBrickDto {

    public $id;
    public $x = array();
    public $y = null;
    public $bricks = null;	//inner scripts


    public function __construct($type, $id, $bricks = array(), $x = null, $y = null) {
        parent::__construct($type);

        $this->id = $id;
        $this->bricks = $bricks;
        $this->x = $x;
        $this->y = $y;
    }

}
