<?php

class WhenActionBrickDto extends ScriptBlockDto {

    public $action;	//"video motion", "timer", "loudness"

    public function __construct($action) {
        parent::__construct("WhenAction");
        $this->action = $action;
    }

}
