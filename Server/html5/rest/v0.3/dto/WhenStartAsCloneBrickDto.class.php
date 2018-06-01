<?php

class WhenStartAsCloneBrickDto extends ScriptBlockDto {

    public function __construct($id, $commentedOut = false) {
        parent::__construct("WhenStartAsClone", $id, $commentedOut);
    }
}
