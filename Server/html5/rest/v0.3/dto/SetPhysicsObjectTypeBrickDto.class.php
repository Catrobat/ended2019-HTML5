<?php

class SetPhysicsObjectTypeBrickDto extends BaseBrickDto {

    public $physicsType;	//"DYNAMIC", "FIXED", "NONE"

    public function __construct($type, $commentedOut = false) {
        parent::__construct("SetPhysicsObjectType", $commentedOut);

        $this->physicsType = $type;
    }

}
