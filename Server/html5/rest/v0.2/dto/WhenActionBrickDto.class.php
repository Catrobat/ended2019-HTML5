<?php

class WhenActionBrickDto extends ScriptBlockDto {

    public $action;	//"spriteTouched", "screenTouched", ("videoMotion", "timer", "loudness", ...) 

    public function __construct($id, $action) {
        parent::__construct("WhenAction", $id);

        $this->action = $action;
    }

}
