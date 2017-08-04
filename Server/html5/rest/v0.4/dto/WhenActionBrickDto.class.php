<?php

class WhenActionBrickDto extends ScriptBlockDto {

    public $action;	//("videoMotion", "timer", "loudness",) "spriteTouched", "screenTouched"

    public function __construct($id, $action, $commentedOut = false) {
        parent::__construct("WhenAction", $id, $commentedOut);

        $this->action = $action;
    }
}
