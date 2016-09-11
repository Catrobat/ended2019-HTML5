<?php

class WhenConditionMetBrickDto extends ScriptBlockDto {

    public $condition;

    public function __construct($id, $condition, $commentedOut = false) {
        parent::__construct("WhenConditionMet", $id, $commentedOut);

        $this->condition = $condition;
    }
}
