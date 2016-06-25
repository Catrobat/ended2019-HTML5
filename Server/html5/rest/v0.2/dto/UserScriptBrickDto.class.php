<?php

class UserScriptBrickDto extends ScriptBlockDto {

    public $id;
    public $header = array();

    public function __construct() {
        parent::__construct("UserScript");
    }

}
