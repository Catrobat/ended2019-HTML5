<?php

class WhenActionBrickDto extends ScriptBlockDto {

    public $action;	//"spriteTouched", "screenTouched", ("videoMotion", "timer", "loudness", ...) 

    public function __construct($id, $action, $commentedOut = false) {
        parent::__construct("WhenAction", $id, $commentedOut);

        $this->action = $action;
    }
}
