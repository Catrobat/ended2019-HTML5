<?php

class WhenBackgroundChangesToBrickDto extends ScriptBlockDto {

    public $lookId;

    public function __construct($id, $lookId, $commentedOut = false) {
        parent::__construct("WhenBackgroundChangesTo", $id, $commentedOut);

        $this->lookId = $lookId;
    }
}
