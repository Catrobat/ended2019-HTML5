<?php

class WhenLookChangeToBrick extends ScriptBlockDto {

    public $spriteId;
    public $lookId;

    public function __construct($id, $spriteId, $lookId, $commentedOut = false) {
        parent::__construct("WhenLookChangeTo", $id, $commentedOut);
        $this->spriteId = $spriteId;
        $this->lookId = $lookId;
    }

}
