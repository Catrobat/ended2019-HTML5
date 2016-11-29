<?php

class WhenActionBrickDto extends ScriptBlockDto {

    public $action;	//("video motion", "timer", "loudness",) "Tapped", "TouchStart"

    public function __construct($id, $action, $commentedOut = false) {
        parent::__construct("WhenAction", $id, $commentedOut);

        $this->action = $action;
    }
}
