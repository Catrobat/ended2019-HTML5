<?php

class WhenCollisionBrickDto extends ScriptBlockDto {

    public $any = true;
    public $spriteId;

    public function __construct($id, $spriteId = null, $commentedOut = false) {
        parent::__construct("WhenCollision", $id, $commentedOut);
        if ($spriteId != null) {
            $this->any = false;
            $this->spriteId = $spriteId;
        }
    }

}
