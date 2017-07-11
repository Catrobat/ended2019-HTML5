<?php

class WhenKeyActionBrickDto extends ScriptBlockDto {

    public $keyCode;

    public function __construct($id, $keyCode) {
        parent::__construct("WhenKeyAction", $id);
        $this->keyCode = $keyCode;	//"space", "up arrow", "down arrow", "right arrow", "left arrow", "any", "a" - "z", "0" - "9"

    }

}
