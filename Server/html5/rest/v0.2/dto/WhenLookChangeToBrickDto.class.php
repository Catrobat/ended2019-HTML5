<?php

class WhenLookChangeToBrick extends ScriptBlockDto {

    public $spriteId;
    public $lookId;

    public function __construct($id, $spriteId, $lookId) {
        parent::__construct("WhenLookChangeTo", $id);
        $this->spriteId = $spriteId;
        $this->lookId = $lookId;
    }

}
