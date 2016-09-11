<?php

class UserScriptArgumentDto {

    public $id;     //variableId
    public $value;  //formula

    public function __construct($variableId, $value) {
        $this->id = $variableId;
        $this->value = $value;
    }
}
