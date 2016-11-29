<?php

class WhenActionGreaterThanBrickDto extends ScriptBlockDto {

    public $value;
    //action: "video motion", "timer", "loudness"

    public function __construct($id, $action, $value) {
        parent::__construct("WhenActionGreaterThan", $id);
        $this->value = $value;
    }

}
