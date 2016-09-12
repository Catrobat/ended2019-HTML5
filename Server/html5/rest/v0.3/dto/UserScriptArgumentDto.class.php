<?php

class UserScriptArgumentDto {

    public $referenceId;   //variableId
    public $value;      //formula

    public function __construct($referenceId, $value) {
        $this->referenceId = $referenceId;
        $this->value = $value;
    }
}
