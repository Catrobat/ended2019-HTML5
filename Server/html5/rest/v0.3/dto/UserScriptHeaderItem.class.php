<?php

class UserScriptHeaderItem {

    public $type;   //text, var, linebreak
    public $name;   //var name or text content
    public $id;     //var id

    public function __construct($type, $name = null, $id = null) {
        $this->type = $type;
        $this->name = $name;
        $this->id = $id;
    }
}
