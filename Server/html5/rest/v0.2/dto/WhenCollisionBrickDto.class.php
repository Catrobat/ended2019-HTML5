<?php

class WhenCollisionBrickDto extends ScriptBlockDto {

    public $any = true;
    public $spriteId;

    public function __construct($id, $spriteId = null) {
        parent::__construct("WhenCollision", $id);
        if ($spriteId != null) {
            $this->any = false;
            $this->spriteId = $spriteId;
        }
    }

}
