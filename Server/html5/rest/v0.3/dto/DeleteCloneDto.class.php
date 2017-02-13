<?php

class DeleteCloneBrickDto extends BaseBrickDto {	//TODO?

    public function __construct($commentedOut = false) {
        parent::__construct("DeleteClone", $commentedOut);
    }
}
