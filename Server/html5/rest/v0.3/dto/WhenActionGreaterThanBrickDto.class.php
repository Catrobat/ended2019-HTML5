<?php

class WhenActionGreaterThanBrickDto extends ScriptBlockDto {

    public $value;
    //action: "video motion", "timer", "loudness"

    public function __construct($id, $action, $value, $commentedOut = false) {
        parent::__construct("WhenActionGreaterThan", $id, $commentedOut);

        $this->value = $value;
    }
}
