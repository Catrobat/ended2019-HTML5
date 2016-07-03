<?php

class WhenActionBrickDto extends ScriptBlockDto {

    public $action;	//"video motion", "timer", "loudness"

    public function __construct($id, $action) {
        parent::__construct("WhenAction", $id);
        $this->action = $action;
    }

}
