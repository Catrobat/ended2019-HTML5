<?php

class WhenProgramStartBrickDto extends ScriptBlockDto {

    public function __construct($id, $commentedOut = false) {
        parent::__construct("WhenProgramStart", $id, $commentedOut);
    }
}
