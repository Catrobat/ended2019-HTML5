<?php

class CreateCloneBrickDto extends BaseBrickDto {	//TODO: delete self and include own sprite id

    public $self;		//default
    public $spriteId;	//always use either ID or SELF

    public function __construct($spriteId = null, $commentedOut = false) {
        parent::__construct("CreateClone", $commentedOut);

        if ($spriteId != null) {
            $this->self = false;
            $this->spriteId = $spriteId;
        }
    }
}
