<?php

class UserScriptBrickDto extends ScriptBlockDto {

    public $header = array();

    public function __construct($id) {
        parent::__construct("UserScript", $id, false);  //definition brick cannot be commented out
    }
}
